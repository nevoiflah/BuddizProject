import React, { createContext, useContext, useState, useEffect } from 'react';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, QueryCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { getCurrentUser, fetchUserAttributes, fetchAuthSession } from 'aws-amplify/auth';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // Initialize from LocalStorage or default to empty array
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('buddiz_cart');
        return saved ? JSON.parse(saved) : [];
    });

    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('buddiz_favorites');
        return saved ? JSON.parse(saved) : [];
    });

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        localStorage.setItem('buddiz_cart', JSON.stringify(cart));
    }, [cart]);

    useEffect(() => {
        localStorage.setItem('buddiz_favorites', JSON.stringify(favorites));
    }, [favorites]);

    useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        try {
            const currentUser = await getCurrentUser();
            const attributes = await fetchUserAttributes();
            const { credentials } = await fetchAuthSession();

            const client = new DynamoDBClient({
                region: "eu-north-1",
                credentials
            });
            const docClient = DynamoDBDocumentClient.from(client);

            // Fetch extended profile from DynamoDB
            let dbUser = {};
            try {
                // Use email as ID (since that's how we seeded it)
                const command = new GetCommand({
                    TableName: "BUDDIZ-Users",
                    Key: {
                        id: attributes.email
                    }
                });

                const response = await docClient.send(command);
                if (response.Item) {
                    dbUser = response.Item;
                }
            } catch (dbErr) {
                console.error("Error fetching user profile from DB:", dbErr);
            }

            // Fetch Favorites from DynamoDB
            try {
                console.log("Fetching favorites for:", attributes.email);
                const favCommand = new QueryCommand({
                    TableName: "BUDDIZ-UserFavorites",
                    KeyConditionExpression: "userId = :uid",
                    ExpressionAttributeValues: {
                        ":uid": attributes.email
                    }
                });
                const favResponse = await docClient.send(favCommand);
                if (favResponse.Items) {
                    console.log("Favorites fetched:", favResponse.Items.length);
                    // We store the full product object in 'product' attribute
                    const storedFavs = favResponse.Items.map(item => item.product).filter(Boolean);
                    if (storedFavs.length > 0) {
                        setFavorites(storedFavs);
                    }
                }
            } catch (favErr) {
                console.error("Error fetching favorites:", favErr);
            }

            setUser({
                name: attributes.name || dbUser.name || currentUser.username,
                email: attributes.email,
                username: currentUser.username,
                ...dbUser // Spread DB attributes (loyaltyPoints, role, etc.)
            });
        } catch (err) {
            // Silence expected error when user is not logged in
            if (err.name === 'UserUnAuthenticatedException' || err.message === 'The user is not authenticated') {
                console.log("User is not signed in.");
            } else {
                console.error("Error in checkUser:", err);
            }
            setUser(null);
            // setFavorites([]); 
        }
        setLoading(false);
    }

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const toggleFavorite = async (product) => {
        console.log("toggleFavorite called for:", product.id);
        console.log("Current User State:", user);

        // Optimistic UI update
        const isFav = favorites.find(f => f.id === product.id);

        if (isFav) {
            setFavorites(prev => prev.filter(item => item.id !== product.id));
            if (user && user.email) {
                removeFromFavoritesDB(user.email, product.id);
            } else {
                console.warn("User or email missing, skipping DB delete");
            }
        } else {
            setFavorites(prev => [...prev, product]);
            if (user && user.email) {
                console.log("Calling addToFavoritesDB via toggle...");
                addToFavoritesDB(user.email, product);
            } else {
                console.warn("User or email missing, skipping DB write. User object:", user);
            }
        }
    };

    const removeFromFavorites = (productId) => {
        const product = favorites.find(f => f.id === productId);
        if (product) toggleFavorite(product);
    };

    // DynamoDB Helpers
    const addToFavoritesDB = async (userId, product) => {
        console.log("Attempting to add favorite to DB:", { userId, productId: product.id });
        try {
            const { credentials } = await fetchAuthSession();
            const client = new DynamoDBClient({ region: "eu-north-1", credentials });
            const docClient = DynamoDBDocumentClient.from(client);

            const params = {
                TableName: "BUDDIZ-UserFavorites",
                Item: {
                    userId: userId,
                    productId: product.id,
                    product: product
                }
            };
            console.log("PutCommand Params:", params);

            await docClient.send(new PutCommand(params));
            console.log("Successfully added favorite to DB");
        } catch (err) {
            console.error("Error adding favorite to DB:", err);
        }
    };

    const removeFromFavoritesDB = async (userId, productId) => {
        console.log("Attempting to remove favorite from DB:", { userId, productId });
        try {
            const { credentials } = await fetchAuthSession();
            const client = new DynamoDBClient({ region: "eu-north-1", credentials });
            const docClient = DynamoDBDocumentClient.from(client);
            await docClient.send(new DeleteCommand({
                TableName: "BUDDIZ-UserFavorites",
                Key: {
                    userId: userId,
                    productId: productId
                }
            }));
            console.log("Successfully removed favorite from DB");
        } catch (err) {
            console.error("Error removing favorite from DB:", err);
        }
    };

    return (
        <AppContext.Provider value={{
            cart,
            favorites,
            user,
            setUser,
            addToCart,
            removeFromCart,
            removeFromFavorites,
            toggleFavorite,
            loading
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
