import React from 'react';
import { Link } from 'react-router-dom';
 
import './header.styles.scss'

const Header = () => (
    <div className="header">
        <Link className="mrs" to={'/'} >The MRS</Link>
        <nav>
            <Link className='link' to={'/faq'} >FAQ</Link>
            <Link className='link' to={'/about'} >About</Link>
        </nav>
    </div>
)

export default Header;