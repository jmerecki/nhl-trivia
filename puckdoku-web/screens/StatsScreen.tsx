import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import axios from 'axios';

type StatsScreenProps = {
  route: RouteProp<RootStackParamList, 'Stats'>;
};

const StatsScreen: React.FC<StatsScreenProps> = ({ route }) => {
  const { username } = route.params;
  const [userStats, setUserStats] = useState<{ games_won: number, games_played: number, correctGuessPct: string }>();
  const [top5Users, setTop5Users] = useState<{ username: string, games_won: number, games_played: number, correctGuessPct: string }[] >([]);

  useEffect(() => {
    // Fetch user stats
    axios.get(`http://localhost:3001/leaderboards/user/${username}`)
      .then((response) => {
        setUserStats(response.data[0]);
      })
      .catch((error) => {
        console.error('Error fetching user stats:', error);
      });

    // Fetch top 5 users
    axios.get('http://localhost:3001/leaderboards/topFive')
      .then((response) => {
        setTop5Users(response.data);
      })
      .catch((error) => {
        console.error('Error fetching top 5 users:', error);
      });
  }, [username]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Stats</Text>
      {userStats && (
        <View style={styles.statsContainer}>
          <Text style={styles.yourStats}>Games Played: {userStats.games_played}</Text>
          <Text style={styles.yourStats}>Games Won: {userStats.games_won}</Text>
          <Text style={styles.yourStats}>
            Guess Accuracy {isNaN(parseFloat(userStats.correctGuessPct))
              ? '0%'
              : `${(parseFloat(userStats.correctGuessPct) * 100).toFixed(2)}%`}
          </Text>
        </View>
      )}

      <Text style={styles.title}>Top 5 Users</Text>
      {top5Users && (
        <View style={styles.tableContainer}>
          <View style={styles.tableRowHeader}>
            <Text style={styles.tableHeader}>Username</Text>
            <Text style={styles.tableHeader}>Games Played</Text>
            <Text style={styles.tableHeader}>Games Won</Text>
            <Text style={styles.tableHeader}>Guess Accuracy</Text>
          </View>
          {top5Users.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableDataBold}>{item.username}</Text>
              <Text style={styles.tableData}>{item.games_played}</Text>
              <Text style={styles.tableData}>{item.games_won}</Text>
              <Text style={styles.tableData}>{`${(parseFloat(item.correctGuessPct) * 100).toFixed(2)}%`}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statsContainer: {
    marginTop: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  tableContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 10, 
    backgroundColor: 'white',
    elevation: 5,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    padding: 10,
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: 'navy', 
    marginBottom: 5,
    borderRadius: 5,
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 5,
    borderRadius: 5,
  },
  tableHeader: {
    flex: 1,
    fontWeight: 'bold',
    padding: 10,
    textAlign: 'center',
    color: 'white',
    fontSize: 16
  },
  tableData: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    fontSize: 16
  },
  tableDataBold: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16
  },
  yourStats: {
    flex: 1,
    padding: 10,
    fontSize: 16
  }
});


export default StatsScreen;
