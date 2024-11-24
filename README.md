# Nonogrammer 

## Description 

Nonogrammer is a web app that allows for the user creation and storage of Nonograms. Users can sign up, create an account, and begin creating Nonograms that can be saved, shared, and played by others. If the users do so chooses to, they are also able to print the Nonograms they create. 

## Instructions 

Begin by creating a user, and then hit manual creator. You can click on the different cells and fill them. Notice how the data cells will populate themselves. Keep in mind, quality Nonograms will have at least one cell filled per row/column. After that, you can name and save your Nonogram, and edit it. Instructions soon to be updated once playable.

## Data Model
Most of the logic for updating nonogram data cells, generating grids, and playing the nonogram is managed client side. Most of our data server-side is managed through the API, such as account management, nonogram data management, and retrieving saved Nonograms from the user. 

## Features 
** Each feature has it's own unique weighted <ins>difficulty</ins>. I.e Printable Nonograms are very quick and easy to make**

** Difficulty is listed from 1-3. (i.e DIF:3) **  

** The EXTRA tasks are not apart of the project, but are more for passion, and does not reflect it's completion** 

- [x] Nonogram Grid Generation 
- [x] Server-Side Account Management DIF:3 
- [x] Server-Side Nonogram Storage DIF: 3 
- [x] Savable & Edittable Nonograms DIF: 3
- [ ] Playable Nonograms DIF: 3 
- [ ] Printable Nonograms DIF: 1 
- [ ] Stylized User Interface DIF: 1 
- [ ] Quality of Life DIF: 2 
- [ ] EXTRA: Image->Nonogram Converter DIF: 3 
- [ ] EXTRA: More User Information, Password Constraints, etc. DIF: 3 
 
## Live URL 
https://digdug.cs.endicott.edu/~wjohnson/nonogrammer/src/index.html

## File Structure
C:.  
│   diagram.pdf  
│   README.md  
│  
└───src  
    │   index.html  
    │  
    ├───js  
    │       account-tools.js  
    │       image-processor.js  
    │       login-logic.js  
    │       nonogram-grid-generator.js  
    │       saved-nonograms-logic.js  
    │       universal-signedin-checker.js  
    │  
    ├───pages  
    │       manual-creator.html  
    │       saved-nonograms.html  
    │  
    ├───php  
    │       api.php  
    │       data.db  
    │       db.php  
    │  
    └───styles  
            main.css  
            nonogram.css  
            saved-nonogram-list.css  

## Current API Actions  

Action: signup
Method: POST
Parameters: username, password
Response: success state, user id 


Action: signin 
Method: POST
Parameters: username, password
Response: success state 


Action: signout
Method: POST
Parameters: null
Response: sucess state 


Action: get-signin
Method: POST
Parameters: null
Response: success state, username, userId


Action: save-nonogram 
Method: POST 
Parameters: userId, nonogramName, rows, columns, nonogramData
Response: success state 


Action: get-nonogram
Method: POST
Parameters: nonogramId
Response: Nonogram SQL Object, sucess state 


Action: get-nonogram-list
Method: POST
Parameters: null
Response: Array of Nonogram SQL Objects, success state 


## Testing 

This web app uses Simple API. An important test I did was loading in Nonograms by it's ID through a web parameter. To do this, I would add in the parameters myself like this.

/manual-creator.html?isUsingSavedNG=true&ngId=1  

The goal of this was to access another user's nonogram without permission. I am happy to report that through the checking done in the back-end, disallowed users are not given access to another user's nonogram.
