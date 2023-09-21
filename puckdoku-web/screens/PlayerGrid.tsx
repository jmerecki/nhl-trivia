import React, { useState, useEffect } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, ActivityIndicator, TextInput, FlatList } from 'react-native';
import axios from 'axios';
import { RootStackParamList } from '../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PlayerGridProps {
  route: RouteProp<RootStackParamList, 'Game'>;
}

const PlayerGrid: React.FC<PlayerGridProps> = ({ route }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { username } = route.params;

  const [guessedPlayers, setGuessedPlayers] = useState<string[][]>(
    Array(3)
      .fill(null)
      .map(() => Array(3).fill(''))
  );
  
  const [squareColors, setSquareColors] = useState<string[][]>(
    Array(3)
      .fill(null)
      .map(() => Array(3).fill('white'))
  );

  const [clickedSquare, setClickedSquare] = useState<{ row: number | null; col: number | null } | null>(null);
  
  const [playerData, setPlayerData] = useState<{ id: number; name: string }[]>([]); 
  const [allPlayers, setAllPlayers] = useState<any[]>([]); 
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [isLoadingPlayers, setLoadingPlayers] = useState(true); // Step 1: Initialize loading state
  const [isPlayerDropdownVisible, setPlayerDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [score, setScore] = useState(0); // Step 1: Initialize the score
  const [numGuesses, setGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    fetchPlayerData();
  }, []);

  // Wait for playerData to be set before getting list of all players
  useEffect(() => {
    if (playerData.length > 0) {
      console.log("fetching all players not including players on grid...");
      fetchAllPlayers();
    }
  }, [playerData]);
  
  // Get players for outside of board
  const fetchPlayerData = async () => {
    try {
      const response = await fetch('http://localhost:3001/players/getBoard');
      const data = await response.json();
      const players = data.board.map((player: { playerId: number; playerName: string }) => ({
        id: player.playerId,
        name: player.playerName,
      }));
      setLoadingPlayers(false);
      setPlayerData(players);
      fetchAllPlayers();
    } catch (error) {
      console.error('Error fetching player data:', error);
    }
  };
  

  const fetchAllPlayers = async () => {
    try {
      const response = await fetch('http://localhost:3001/players/all');
      const data = await response.json();
      // Remove players that were picked to be on outside of board
      const players = data
        .filter((player: { playerId: number }) =>
          !playerData.some((boardPlayer) => boardPlayer.id === player.playerId)
        )
        .map((player: { playerName: string; playerId: number }) => ({
          name: player.playerName,
          id: player.playerId
        }));
        
      setAllPlayers(players);
    } catch (error) {
      console.error('Error fetching player data:', error);
    }
  };

  const handleSquarePress = (rowIndex: number, colIndex: number) => {
    setClickedSquare({ row: rowIndex, col: colIndex });
    setPlayerDropdownVisible(true);
  };

  const handleGuessSubmit = (selectedPlayer: any) => {
    setPlayerDropdownVisible(false);
    let player1Id = 0;
    let player2Id = 0;
    let player1Name = "";
    let player2Name = "";
    let selectedPlayerId = 0;
    
    if (clickedSquare && clickedSquare.row !== null && clickedSquare.col !== null) {
      player1Id = playerData[clickedSquare.col].id;
      player2Id = playerData[clickedSquare.row + 3].id;
      player1Name = playerData[clickedSquare.col].name;
      player2Name = playerData[clickedSquare.row + 3].name;


      selectedPlayerId = selectedPlayer.id;
      axios.post('http://localhost:3001/players/checkGuess', { player1Id, player2Id, selectedPlayerId })
        .then((response) => {
          console.log('Response: ', response.data);
          const isCorrect = response.data.isCorrect;
          if (isCorrect) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setScore(score + 1);
          }
          setGuesses(numGuesses + 1)

          // update colors of squares after guess
          const newSquareColors = [...squareColors];
          if(clickedSquare.row !== null && clickedSquare.col !== null){
            newSquareColors[clickedSquare.row][clickedSquare.col] = isCorrect ? 'green' : 'red';        
          setSquareColors(newSquareColors);

          const newGuessedPlayers = [...guessedPlayers];
          newGuessedPlayers[clickedSquare.row][clickedSquare.col] = selectedPlayer.name; 
          setGuessedPlayers(newGuessedPlayers);
          }
          if (numGuesses == 8) {          
            setGameOver(true);
            let didUserWin = score == 9 ? 1 : 0;
            updatePlayerStatistics(username, 1, didUserWin, score, 9);
          }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      }
      axios.post('http://localhost:3001/players/answer', { player1Name, player2Name })
      .then((res) => {
        console.log('Answer:', res.data);
      });
      
  
    setSelectedPlayer(null);
  };

  const updatePlayerStatistics = async (username: string, gamesPlayed: number, gamesWon: number, correctGuesses: number, totalGuesses: number) => {
    try {
      const response = await axios.post('http://localhost:3001/users/updateStats', {
        username,
        gamesPlayed,
        gamesWon,
        correctGuesses,
        totalGuesses
      });
  
      if (response.data.message === 'Player statistics updated successfully') {
        console.log('Player statistics updated successfully');
      } else {
        console.error('Failed to update player statistics');
      }
    } catch (error) {
      console.error('Error updating player statistics:', error);
    }
  };

  const Scoreboard = () => {
    return (
      <View style={styles.scoreboard}>
          <Text style={styles.scoreText}>Score: {score}/9</Text>
      </View>
    );
  };

  // Delete token and navigate to login screen
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      console.log("logging out...");
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const PlayerDropdown = () => {
    const filteredPlayers = allPlayers.filter(player =>
      player.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
    return isPlayerDropdownVisible ? (
      <View style={styles.playerDropdown}>
        <TextInput
          placeholder="Search players"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
          style={styles.searchInput}
          autoFocus={true}
        />
        <ScrollView style={styles.searchList}>
          <FlatList
            data={filteredPlayers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.playerOption}
                onPress={() => {
                  const selectedPlayer = item;
                  setSelectedPlayer(selectedPlayer);

                  handleGuessSubmit(selectedPlayer);
                  setSearchQuery('');
                }}
              >
                <Text style={styles.playerOptionText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            horizontal={false}
          />
        </ScrollView>
      </View>
    ) : <View style={styles.hiddenDropdown}>
        </View>;
  };
  
  // Reset game states
  const resetGame = () => {
    fetchPlayerData().then(() => {
      setSquareColors(
        Array(3)
          .fill(null)
          .map(() => Array(3).fill('white'))
      );
      setClickedSquare(null);
      setGameOver(false);
      setScore(0);
      setGuessedPlayers(
        Array(3)
          .fill(null)
          .map(() => Array(3).fill(''))
      );
      
    });
  };
  
  return (
    <ScrollView style={styles.scrollView}>
    <View style={styles.container}>
      {isLoadingPlayers ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="blue" style={styles.loadingIndicator} />
          <Text style={styles.loadingText}>Loading grid...</Text>
        </View>
      ) : gameOver ? (
        <View>
          <Text style={styles.titleText}>Game Over</Text>
          <Text style={styles.gameOverScoreText}>Final Score: {score}/9</Text>
          <TouchableOpacity style={styles.gameOverButton} onPress={resetGame} >
            <Text style={styles.gameOverButtonText}>New Game</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <Text style={styles.titleText}>
            Welcome to Puckdoku, {username}!
          </Text>
          <View style={styles.infoContainer}>
            <View style={styles.helpTextContainer}>
                <Text style={styles.boldText}>How to play: </Text>
                <Text style={styles.helpText}>
                Guess a player who has been teammates (at 
                least NHL 1GP) {'\n'}with the corrsponding players outside the grid. {'\n'}
                Player selection is limited to current active NHL players. An example {'\n'}
                correct answer can be seen in the console after each guess.
                </Text>
            </View>
            <View> 
              <TouchableOpacity
                style={styles.logOut}
                onPress={() => handleLogout()}
              >
                <Text style={styles.logOutText}>Logout</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.statsButton}
                onPress={() => navigation.navigate('Stats', { username: username })}
              >
                <Text style={styles.statsButtonText}>Statistics</Text>
              </TouchableOpacity>
              <Scoreboard />
              </View>
          </View>
          {/* Player names on top of grid  */}
          <View style={styles.playerNamesTop}>
            {playerData.slice(0, 3).map((player, index) => (
              <Text key={index} style={styles.playerName}>
                {player.name}
              </Text>
            ))}
          </View>
          {/* Grid with players on left side */}
          <View style={styles.gridAndDropdown}> 
            <View style={styles.grid}>
              {playerData.slice(3, 6).map((player, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                  <Text key={rowIndex} style={styles.playerNameLeft}>
                    {player.name}
                  </Text>
                  {[0, 1, 2].map((_, colIndex) => (
                    <TouchableOpacity
                      key={colIndex}
                      style={[
                        styles.square,
                        squareColors[rowIndex][colIndex] === 'red'
                          ? styles.redSquare
                          : squareColors[rowIndex][colIndex] === 'green'
                          ? styles.greenSquare
                          : null
                      ]}
                      onPress={() => {
                        // Check if the square hasn't been guessed yet
                        if (squareColors[rowIndex][colIndex] === 'white') {
                          handleSquarePress(rowIndex, colIndex);
                        }
                      }}
                    >
                      <Text style={styles.selectedPlayerText}>
                        {guessedPlayers[rowIndex][colIndex] || 'Select a player'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}          
            </View>
            <PlayerDropdown />
          </View>
        </View>      
      )}  
    </View>
    </ScrollView>
  );  
};

const styles = StyleSheet.create({
  scrollView: {
    height: '100%', 
  },
  container: {
    alignItems: 'center',
    padding: 20,
  },
  playerNamesTop: {
    flexDirection: 'row',
    width: '100%', 
    marginLeft: 110,
  },  
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 120,
    marginRight: 20  
  },
  grid: {
    marginTop: 10
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerNameLeft: {
    fontSize: 16,
    fontWeight: 'bold',
    width: 100,
  },
  square: {
    width: 130,
    height: 130,
    borderWidth: 2,
    borderRadius: 6,
    borderColor: 'navy',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.8, 
    shadowRadius: 4,
    transition: 'background-color 0.8s',
  },
  input: {
    width: 120, 
    height: 30,
    borderWidth: 1,
    borderColor: 'black',
    padding: 5,
    marginTop: 10,
  },
  selectedPlayerText: {
    fontSize: 16,
    textAlign: 'center'
  },
  titleText: {
    fontSize: 44,
    fontWeight: 'bold',
    marginBottom: 50
  },
  playerDropdown: {
    backgroundColor: 'white',
    borderRadius: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)', 
    border: '1px solid #ccc',
    maxHeight: 400,
    width: 200,
    overflowY: 'auto',
    marginTop: 20,
    marginBottom: 200,
    marginLeft: 50,
    overflow: 'hidden',
  },
  hiddenDropdown: {
    backgroundColor: 'white',
    borderRadius: 4, 
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    border: '1px solid #ccc',
    maxHeight: 400,
    width: 200,
    overflowY: 'auto',
    marginTop: 20,
    marginBottom: 200,
    marginLeft: 50,
    overflow: 'hidden',
    opacity: 0
  },
  searchInput: {
    borderWidth: 1,
    borderColor: 'lightgray',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  redSquare: {
    backgroundColor: 'red',
  },
  greenSquare: {
    backgroundColor: '#5cb85c',
  },
  scoreboard: {
    width: 110,
    backgroundColor: 'lightgray',
    padding: 10,
    marginTop: 20,
    marginRight: 10,
    marginBottom: 20,
    alignSelf: 'flex-end',
    borderRadius: 4,
    borderColor: 'black',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'navy',
    width: 110,
    padding: 10,
    borderRadius: 4,
    zIndex: 2,
    marginRight: 10,
  },
  statsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  loadingContainer: {
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 20, 
  },
  loadingIndicator: {
    marginTop: 20, 
    marginBottom: 20
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  logOut: {
    alignSelf: 'flex-end',
    backgroundColor: '#b23b3b',
    width: 110,
    padding: 10,
    borderRadius: 4,
    zIndex: 2,
    marginRight: 10,
    marginBottom: 20,
  },
  logOutText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpTextContainer: {
    width: '80%',
    alignSelf: 'center',
    marginRight: 20
  },
  helpText: {
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10,
  },
  boldText: {
    fontWeight: 'bold',
    fontSize:18
  },
  gameOverScoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center'
  },
  gameOverButton: {
    backgroundColor: 'navy',
    padding: 10,
    borderRadius: 4,
    zIndex: 2,
  },
  gameOverButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchList: {
    flex: 1,
    backgroundColor: '#white',
  },
  playerOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0', 
  },
  playerOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  gridAndDropdown: {
    flexDirection: 'row',
  },
});

export default PlayerGrid;
