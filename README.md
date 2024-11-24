# Nonogrammer 

## Description 

Nonogrammer is a web app that allows for the user creation and storage of Nonograms. Users can sign up, create an account, and begin creating Nonograms that can be saved, shared, and played by others. If the users do so chooses to, they are also able to print the Nonograms they create. 

## Instructions 

Begin by creating a user, and then hit manual creator. You can click on the different cells and fill them. Notice how the data cells will populate themselves. Keep in mind, quality Nonograms will have at least one cell filled per row/column. After that, you can name and save your Nonogram, and edit it. Instructions soon to be updated once playable.

## Data Model
Most of the logic for updating nonogram data cells, generating grids, and playing the nonogram is managed client side. Most of our data server-side is managed through the API, such as account management, nonogram data management, and retrieving saved Nonograms from the user. 

## Features 
** Each feature has it's own unique weighted <ins>difficulty</ins>. I.e Printable Nonograms are very quick and easy to make**
- [x] Nonogram Grid Generation 
- [x] Server-Side Account Management
- [x] Server-Side Nonogram Storage 
- [x] Savable & Edittable Nonograms 
- [ ] Playable Nonograms 
- [ ] Printable Nonograms 
- [ ] Stylized User Interface 
- [ ] EXTRA: Image->Nonogram Converter
- [ ] EXTRA: More User Information, Password Constraints, etc. 
 
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




