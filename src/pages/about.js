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
                    <h1 >About me </h1>
                    <h3> 
                    I'm the founder/ceo/lead frontend dev/marketer of my app {}
                    <a href="metoo.io">metoo</a>
                        {/* <h6>
                            (you can find out more about my experience with metoo in my blog posts below)
                        </h6> */}
                    </h3>
                    <h3>
                        I make memes: I've gotten more than 500k likes and 40 million impressions between 20 of my 
                        <a href="https://twitter.com/ProdigyNelson/timelines/677195667207491584"> most popular tweets </a>
                    </h3>
                    <h3>
                        I blog: so far I've only written {}
                        <a href="https://medium.com/@derek_nelson/the-story-of-a-startup-pt-1-inception-launch-82ed678cdb87" >pt. 1 of the story of metoo</a>
                        , but there's more coming soon :)
                    </h3>
                </div>
                {/* <ScrollToNext pageSelector=".about-page" /> */}
            </div>
        )
    } 
} 

