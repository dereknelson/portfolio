import React, { Component } from 'react'
// import { Link } from 'gatsby'
import './pageStyles.css';
import '../styles/base.scss';
// import Layout from '../components/layout'
// import Image from '../components/image'
// import SEO from '../components/seo'
import SocialIcons from '../components/SocialIcons/SocialIcons';

export default class App extends Component{ 
    render(){ 
        return (
            <div style={{ backgroundColor: 'white' }} className="landing-page">
                {/* <Nav /> */}
                <main style={{ color: 'black' }}>
                    <div className="intro-wrapper">
                        <div className="intro-name">Hi! I'm Derek.</div>
                        <div className="tagline">
                            Entrepreneur | Full Stack Dev | Blogger
                        </div>
                        <SocialIcons />
                    </div>
                </main>
            </div>
        )
    } 
} 