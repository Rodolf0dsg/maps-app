import { useCallback, useEffect, useRef, useState } from "react";

import { v4 } from 'uuid';

import mapboxgl from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"
import { Subject } from "rxjs";
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const house = [ 
    -70.195625,
    11.767919, 
];

export const useMapbox = ( initialPoint ) => {

    //referencia al div del mapa
    const mapDiv = useRef();
    const setRef = useCallback( ( node ) => {
        mapDiv.current = node;
    }, []);

    //referencia a los marcadores
    const markers = useRef({});

    //observables de rxjs
    const markerMovement = useRef( new Subject() );
    const newMarker = useRef( new Subject() );


    //mapa y coordenadas
    const map = useRef();
    const [ coords, setCoords ] = useState( initialPoint );
    
    //funcion para agregar marcadores
    const addMarker = useCallback((ev, id)=> {

        const { lat, lng } = ev.lngLat || ev;

        const marker = new mapboxgl.Marker();
        marker.id = id ?? v4();

        marker
            .setLngLat([ lng, lat])
            .addTo( map.current )
            .setDraggable( true );

        markers.current[ marker.id ] = marker;

        if( !id ){
            newMarker.current.next({
                id: marker.id,
                lng,
                lat,
            });
        };

        //escuchar movimientos del marcador
        marker.on('drag', ({target}) => {
        
            const { id } = target;
            const { lng, lat } = target.getLngLat();
                
            markerMovement.current.next({
                id, 
                lng,
                lat,
            });
        });

    }, [] ); 

    //funcion para actualizar el movimiento del marcador
    const moveMarker = useCallback(({ id, lat, lng })=>{

        markers.current[ id ].setLngLat([lng, lat]);

    }, [])

    useEffect(() => {

        map.current = new mapboxgl.Map({
        	container: mapDiv.current,
        	// style: 'mapbox://styles/mapbox/streets-v12', // style URL
        	center: [ initialPoint.lng, initialPoint.lat], // starting position [lng, lat]
        	zoom: initialPoint.zoom, // starting zoom
        });

    }, [ initialPoint ]);

    // cuando se mueve el mapa
    useEffect(() => {

        map.current?.on('move', ()=>{
            const { lat, lng } = map.current.getCenter();
            setCoords({
                lng: lng.toFixed(4),
                lat: lat.toFixed(4),
                zoom: map.current.getZoom().toFixed(2),
            });
        });

        return () => map.current?.off('move');

    }, []);

    //agregar marcadores cuando se hace click

    useEffect(() => {

        map.current?.on('click', addMarker );

    }, [ addMarker ]);
    

    //ir para mi casa
    const handleButtonClick = () => {
        map.current.flyTo({
            center: house,
            zoom: 20,
        });
    };

    return {
        addMarker,
        coords,
        handleButtonClick,
        newMarker$: newMarker.current,
        markerMovement$: markerMovement.current,
        markers,
        moveMarker,
        setRef,
    }

}
