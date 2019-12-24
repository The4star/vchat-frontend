import React from 'react';

import './card.styles.scss';

const Card = ({header, link, price, image, description}) => (
    <div className="card">
        <div className="img-container">
           <img src={image} alt="restaurant hero"></img> 
        </div>
        <h3>{header}</h3>
        <p>{description}</p>
        <p className="price">{price}</p>
        <a href={link} target="_blank" rel="noopener noreferrer"><button>Learn more</button></a>
    </div>
) 

export default Card;