[![N|Solid](https://static.wixstatic.com/media/72ffe6_da8d2142d49c42b29c96ba80c8a91a6c~mv2.png)](https://nasriya.net)
# Travel Planner
___

## Live Demo
To view a live demo, just click [here](https://travel-planner.nasriya.net/).

**Note:** Your data will be logged upon visiting the website, including your IP address.

---
## Description
The Travel Planner project is part of the Udacity Frontend Web Developer Nanodegree, designed to showcase proficiency in building interactive web applications. This project focuses on creating a responsive and dynamic travel planning tool using HTML, CSS, and JavaScript. The application integrates multiple APIs, including weather forecasts and destination imagery, to provide users with real-time information and recommendations for their travel plans.

## Features
- API Integration: Utilizes APIs such as Weatherbit and Pixabay to fetch weather forecasts and destination images.
- Dynamic Updates: Provides real-time updates based on user inputs, ensuring accurate travel information.
- Responsive Design: Built with a responsive layout to ensure usability across devices.
- User-Friendly Interface: Intuitive interface design for seamless navigation and interaction.

## Technologies Used
- HTML
- CSS (including Sass for styling)
- JavaScript (ES6+)
- Webpack for bundling assets
- Various APIs (Weatherbit, Pixabay, etc.)

---
### Installation
1. **Clone the repository:** To clone the project, just run this command in your terminal:
```powershell
git clone https://github.com/nasriyasoftware/Udacity_FEND_TravelApp.git
cd .\Udacity_FEND_TravelApp\
```

2. **Install dependencies** using `npm install`.
```shell
npm install
```

---
## Prerequisites
You must follow these steps, or otherwise the application won't work:

1) Create a `.env` file in the root directory of the project.
2) Copy the following key-value pairs and paste them in the `.env` file.
```ini
PORT=<port-number>
GEONAMES_API_KEY="<geonames-api-key>"
PIXABAY_API_KEY="<pixabay-api-key>"
WEATHERBIT_API_KEY="weatherbit-api-key"
```
4. Replace the placeholder valuse using your own API keys.

---
## How to run

### Start the server in `dev` mode:
```shell
npm run build-dev
```
Then click [here](http://localhost:3000) to view the application.

### Start the server in `prod` mode:

```shell
npm start
```

Running the above command will **build** then start the server, so you don't need to manually build.
To view the applocation, enter `http://localhost:<PORT>` in your browser. Make sure to first repalce `<PORT>` with the actual port you defined in the `.env` file. 

---
## License
Please read the license from the root directory of this repository
