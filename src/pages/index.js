import React, { Component } from 'react'
// import { Link } from 'gatsby'
import './pageStyles.css';
import './responsive.css'
import SocialIcons from '../components/SocialIcons/SocialIcons';
import About from './about';
import Skills from './skills';

export default class App extends Component { 
    render(){ 
        return (
            <div style={{ backgroundColor: 'white' }} className="landing-page">
                {/* <Nav /> */}
                <main style={{ color: 'black' }}>
                    <div className="intro-wrapper">
                        <img src={require('../images/avatar.jpg')}/>
                        <div className="intro-name">Hi! I'm Derek.</div>
                        <div className="tagline">Entrepreneur | Full Stack Dev | Writer</div>
                        <SocialIcons />
                        <About/>
                        <Skills/>
                    </div>
                </main>
                {/* <ScrollToNext pageSelector=".about-page" /> */}
            </div>
        )
    } 
} 

