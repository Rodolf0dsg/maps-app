import 'mapbox-gl/dist/mapbox-gl.css';

import { useMapbox } from "../hooks/useMapbox";
import { useContext, useEffect } from 'react';
import { SocketContext } from '../context/SocketProvider';

const initialPoint = {
    lng: 5,
    lat: 34,
    zoom: 2,
}

const coordStyles = {
    backgroundColor: 'rgba(0, 0, 0, .5)',
    borderRadius: '20px',
    color: '#ffffff',
    left: '20px',
    padding: '10px',
    position: 'fixed',
    top: '20px',
    zIndex: '99',
    fontWeight: 'bold',
}

export const MapPage = () => {
    
    const { coords, setRef, handleButtonClick, newMarker$, markerMovement$,addMarker, moveMarker } = useMapbox( initialPoint );
    const { socket } = useContext( SocketContext );

    //nuevo marcador
    useEffect(()=> {

        newMarker$.subscribe( marker => {
            socket.emit('new-marker', marker);
        });

    }, [ newMarker$, socket ]);

    //escuchar los marcadores existentes
    useEffect(() => {
        
        socket.on('active-markers', (markers) => {
            for (const key of Object.keys( markers )) {
                addMarker( markers[ key ], key );
            };
        });

    }, [ socket, addMarker ]);

    //mover marcador mediante sockets

    useEffect(()=>{
        socket.on('update-marker', ( marker )=>{
            moveMarker( marker );
        });
    }, [ socket, moveMarker ])
    

    //escuchar cuando se mueva un marcador
    useEffect(()=> {

        markerMovement$.subscribe( marker => {
            socket.emit('update-marker', marker);
        });

    },[ socket, markerMovement$ ]);

    //escuchar nuevos marcadores
    useEffect(() => {
        socket.on('new-marker', ( marker )=>{
            addMarker( marker, marker.id );
        });
    }, [ socket, addMarker ]);
    

    return (
        <>
            <div 
                style={ coordStyles }    
            >
                Lng: { coords.lng } | Lat: { coords.lat } | zoom: { coords.zoom } 
            </div>

            <button className='reset-button' style={{ position: 'fixed', zIndex: '100', }} onClick={handleButtonClick}>
                Go to house
            </button>

            <div
                ref={ setRef }
                className='mapContainer'
            />  
        </>
    )
}
