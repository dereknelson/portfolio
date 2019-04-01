import React, { Component } from 'react'
// import { Link } from 'gatsby'
import './pageStyles.css';
import './responsive.css'
import Subscribe from '../components/subscribe/subscribe';

export default class About extends Component {
    render(){ 
        return (
            <div style={{ backgroundColor: 'white' }} className="about-container" >
                {/* <Nav /> */}
                <div className="about">
                    <h1 >About me </h1>
                    {/* <h5 style={{ fontWeight: 'normal' }} >*Disclaimer* this portfolio is a WIP. I'm pretty busy :) </h5> */}
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
                        I blog: so far I've written {}
                        <a href="https://medium.com/@derek_nelson/the-story-of-a-startup-pt-1-inception-launch-82ed678cdb87" >pt. 1 of the story of metoo</a>
                        {} and {}
                        <a href="https://medium.com/@derek_nelson/the-five-biggest-things-ive-learned-from-starting-up-so-far-ecbdd3316a96" >the five biggest things I've learned from starting up</a>
                        , with more coming soon :)
                    </h3>
                    <Subscribe/>
                </div>
                {/* <ScrollToNext pageSelector=".about-page" /> */}
            </div>
        )
    } 
} 

