import React, { Component } from 'react'
// import { Link } from 'gatsby'
import './pageStyles.css';
import './responsive.css'

export default class About extends Component {
    render(){ 
        return (
            <div style={{ backgroundColor: 'white' }} className="about-container" >
                {/* <Nav /> */}
                <div className="about">
                    <h1>Blog</h1>
                    <h3>
                        I blog: so far I've only written 
                        <a href="https://medium.com/@derek_nelson/the-story-of-a-startup-pt-1-inception-launch-82ed678cdb87" > pt. 1 of the story of metoo, </a>
                        but there's more coming soon :)
                    </h3>
                </div>
            </div>
        )
    } 
} 

