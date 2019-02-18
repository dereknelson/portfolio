import React from 'react';
import PropTypes from 'prop-types';
import './style.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter, faGithub, faMediumM, faInstagram } from '@fortawesome/fontawesome-free-brands'

const SocialIcons = (props, context) => {
//   const { theme: { colorPrimary } } = context;

    return (
        <div className="social-icons animate-icons">
            <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/prodigynelson" style={{ color: 'black' }}>
                <FontAwesomeIcon icon={faTwitter}/>
            </a>
            <a target="_blank" rel="noopener noreferrer" href="https://instagram.com/prodigynelson" style={{ color: 'black' }}>
                <FontAwesomeIcon icon={faInstagram}/>
            </a>
            <a target="_blank" rel="noopener noreferrer" href="https://medium.com/@derek_nelson" style={{ color: 'black' }}>
                <FontAwesomeIcon icon={faMediumM}/>
            </a>
            <a target="_blank" rel="noopener noreferrer" href="https://github.com/dereknelson" style={{ color: 'black' }}>
                <FontAwesomeIcon icon={faGithub}/>
            </a>
        </div>
    )
}

SocialIcons.contextTypes = {
    theme: PropTypes.any
};

export default SocialIcons