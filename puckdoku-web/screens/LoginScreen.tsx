import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

const LoginScreen: React.FC = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    useEffect(() => {
        // if a username has a valid token tied to it, redirect to game screen
        const checkTokenAndRedirect = async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                const response  = await fetch('http://localhost:3001/users/decodeJwt', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });
                const decoded = await response.json();

                if (decoded){
                    navigation.navigate('Game', { username: decoded.username.username });
                    let d = new Date(0);
                    d.setUTCSeconds(decoded.username.exp);
                    console.log("Token expires at: "+d);
                }
            }
          } catch (error) {
            console.error('Error checking token:', error);
          }
        };
    
        checkTokenAndRedirect();
      }, []);

    const handleLogin = async () => {
        if (username.length === 0){
            console.error('Username field must not be empty');
            alert('Username field must not be empty');
            navigation.navigate('Login');
        }
        else{
            try {
                const response = await fetch('http://localhost:3001/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });
                if (response.ok) {
                    const userData = await response.json();
                    // set token
                    await AsyncStorage.setItem('token', userData.user.token);
                    navigation.navigate('Game', { username: userData.user.username });
                } else {
                    alert('Invalid username/password combination. Please try again.');
                }
            } catch (error) {
                console.error('Error logging in:', error);
                alert('An error occurred while logging in. Please try again later.');
            }
        }      
    };

    return (
        <View style={styles.container}>
            <View style={styles.loginContainer}>
                <View style={styles.leftSide}>
                    <Text style={styles.title}>Welcome to Puckdoku!</Text>
                    <Text style={styles.subtitle}>Login or create an account to play!</Text>
                </View>
                <View style={styles.rightSide}>
                    <TextInput
                        placeholder="Username"
                        value={username}
                        onChangeText={(text) => setUsername(text)}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Password"
                        value={password}
                        onChangeText={(text) => setPassword(text)}
                        secureTextEntry
                        style={styles.input}
                    />
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                    >
                        <Text style={styles.buttonText}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.createUserButton}
                        onPress={() => navigation.navigate('Registration')}
                    >
                        <Text style={styles.createUserButtonText}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 10,
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 5,
    },
    leftSide: {
        flex: 1, 
        marginRight: 20,
    },
    rightSide: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        marginBottom: 20,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: 'gray',
        marginVertical: 10,
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#f2f2f2',
    },
    loginButton: {
        backgroundColor: 'navy',
        padding: 12,
        borderRadius: 8,
        marginTop: 20,
        borderColor: 'navy', 
        borderWidth: 2, 
        shadowColor: 'gray', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    createUserButton: {
        backgroundColor: 'white', 
        padding: 12,
        borderRadius: 8,
        marginTop: 20,
        borderColor: 'gray', 
        borderWidth: 2, 
        shadowColor: 'gray', 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.5, 
        shadowRadius: 4, 
    },
    createUserButtonText: {
        color: 'gray',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 'bold',
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default LoginScreen;
