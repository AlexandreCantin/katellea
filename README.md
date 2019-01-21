
```
   _   __        _          _  _
  | | / /       | |        | || |
  | |/ /   __ _ | |_   ___ | || |  ___   __ _
  |    \  / _` || __| / _ \| || | / _ \ / _` |
  | |\  \| (_| || |_ |  __/| || ||  __/| (_| |
  |_| \_/ \__,_| \__| \___||_||_| \___| \__,_|
  
```

# Objectives

:fr: Katellea a pour objectif d'aider des personnes désireuses de réaliser des dons du sang, mais ne souhaitant pas le faire seul (quelqu'en soit la raison), à solliciter des personnes interessées dans son entourage. Dans un second temps, elles pourront convenir de la meilleure date pour réaliser ce don. L’objectif global est d’attirer les personnes hésitantes à faire des dons du sang grâce à davantage de convivialité.

:gb: Katellea's goal is to help people who want to make blood donation, but not alone, to find interesting people in their entourage. In a second part, they can decide together of the best date to make this donation. The main objective is to help hesistant people to make their first blood donation through conviviality.


## Main librairies

### Server side :

    - Node.js & Express : Back-end server
    - MongoDB & Mongoose : ORM

### Front-end :

    - React, generated with `create-react-app`
    - Redux / react-redux
    - @reach/router
    - dayjs
    - final-form / react-final-forms

## Install development environment

### Installation

:warning: I assume you already have **Node.js** and **Docker** installed on your machine :warning:

### :dvd: Node server

* In the main folder, run `npm install` to install dependencies (may take a while).
* Then, run `docker-compose up -d` or `npm run database` to start Mongo database (may take a while)
* Add french cities and french donations establishment by doing: `npm run cities-import` and `npm run establishments-import`
* Optionnal: add some seeding data to the database by doing `cd conf && ./restore-dev-database.sh`
* Start server by doing: `npm run start`

### :computer: React frontend

* Go the `frontend/` folder and run `npm install`
* Create a `environment-local.js` in `src/` folder with content:
```
const overridesEnvironmentValues = {};
export default overridesEnvironmentValues;
```
* Run `npm run start` and wait for your browser to start at `localhost:8080`

* Note: if you got troubles with _max watches_, you can type in your terminal :
`echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p`


## Testing

:construction: Coming soon :construction:

## License

This project is licensed under the [GNU Affero General Public License](./LICENSE).

## How to contribute

We are open to comments, questions and contributions! Feel free to [open an issue](github.com/AlexandreCantin/katellea/issues/new), fork the code, make changes and [open a pull request](https://github.com/AlexandreCantin/katellea/pulls).

:warning: I'm doing this project on my free time, so I can't promise quick answers ! :warning:
