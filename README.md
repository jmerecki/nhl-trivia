# puckdoku project

NHL Trivia game

# Installation
1. Clone the repository to your local machine
   
   ```
   git clone https://github.com/jmerecki/puckdoku.git
   ```

2. Navigate to the puckdoku-api directory

   ```
   cd puckdoku/puckdoku-api
   ```

3. Install the dependencies for the Express server
   ```
   npm i
   ```

5. Navigate to the puckdoku-web directory
   ```
   cd ../puckdoku-web
   ```

7. Install the dependencies for the React Native app
   ```
   npm i
   ```

# To Play

1. Navigate to the puckdoku-web directory and run
   ```
   npm start
   ```
2. Navigate to the puckdoku-api directory and run
   ```
   npm start
   ```
3. Click 'w' to run the app in a web browser

   A browser should appear running the app on port 19006


** Note: The game does not check specificlly if the selected player played in at least one game with the player on the outside of the grid -the game checks if the selected player was on the same team during the same season as the players on the outside. I understand there can be  edge cases, however for the sake of time and simplicity I decided to go with the route that I chose. Please reach out for any questions


   
