import React from 'react'
import ReactDOM from 'react-dom/client'
import { MapsApp } from './MapsApp'
import './main.css';
import 'mapbox-gl/dist/mapbox-gl.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <MapsApp />
);