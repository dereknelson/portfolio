import React, { Component } from 'react'
// import { Link } from 'gatsby'
import './pageStyles.css';
import './responsive.css'

export default class Skills extends Component {

    render(){ 
        return (
            <div style={{ backgroundColor: 'white' }} className="about-container" >
                <h1 >Skills</h1>
                <div className="skills">
                    <this.Technical/>
                    <this.Design/>
                    {/* <this.General /> */}
                </div>
            </div>
        )
    }
    Technical = () => (
        <div className="skillsList" >
            <h3>Technical</h3>
            <li>JavaScript</li>
            <li>React Native</li>
            <li>Redux</li>
            <li>Expo</li>
            <li>Node</li>
            <li>Docker</li>
            <li>Python</li>
        </div>
    ) 
    Design = () => (
        <div className="skillsList" >
            <h3>Design</h3>
            <li>Interface design</li>
            <li>Photoshop</li>
            <li>Sketch</li>
            <li>Sony Vegas</li>
            <li>After Effects</li>
        </div>
    ) 
    General = () => (
        <div className="skillsList" >
            <h3>General</h3>
            <li>Leadership</li>
            <li>Social media marketing</li>
            <li>Sketch</li>
        </div>
    ) 
} 

