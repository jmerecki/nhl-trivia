import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Modal from 'react-native-modal';
import { TouchableOpacity } from 'react-native-gesture-handler';


const UserRegistrationScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [passwordsMatch, setPasswordsMatch] = useState(true); 

  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);

  const navigation: NavigationProp<any> = useNavigation();

  const handleRegistration = async () => {
    if (password !== confirmPassword) {
      setPasswordsMatch(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      console.log(response);
      if (response.ok) {
        setIsSuccessModalVisible(true);
        setTimeout(() => {
          setIsSuccessModalVisible(false);
          navigation.navigate('Login');
        }, 3000);
      } else {
        setIsErrorModalVisible(true);
      }
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.createContainer}>
      <Text style={styles.title}>Create User</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={(text) => setUsername(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
        />
        {/* Error message for password mismatch */}
        {!passwordsMatch && (
          <Text style={styles.errorText}>Passwords do not match</Text>
        )}
      <TouchableOpacity
          style={styles.button}
          onPress={handleRegistration}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

      <Modal isVisible={isSuccessModalVisible}>
        <View style={styles.successModal}>
          <Text style={styles.successModalText}>Signup Successful! You will be redirected back to the login screen.</Text>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal isVisible={isErrorModalVisible}>
        <View style={styles.errorModal}>
          <Text style={styles.errorModalText}>Signup Failed. Please try again with a different username.</Text>
          <Button
            title="OK"
            onPress={() => setIsErrorModalVisible(false)}
          />
        </View>
      </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createContainer: {
    backgroundColor: 'white',
    padding: 60, 
    borderRadius: 10,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  button: {
    backgroundColor: 'navy',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    width: 200,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f2f2f2'
  },
  successModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  successModalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorModalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default UserRegistrationScreen;
