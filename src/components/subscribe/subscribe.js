import React, { Component } from 'react'
// import { Link } from 'gatsby'
import '../../pages/pageStyles.css';
import '../../pages/responsive.css'
import './subscribe.css'
import MailChimpSubscribe from 'react-mailchimp-subscribe'
import axios from 'axios'

const URL = "https://metoo.us16.list-manage.com/subscribe/post?u=83b8fc299ef72af629759350e&id=c36bc8779a"
const url2 = "https://us16.api.mailchimp.com/3.0/lists/c36bc8779a/members/"
const key = '92d00495ac09a9a93f0936c29e22f36c-us16'
export default class Subscribe extends Component {
    constructor(props){
        super(props)
        this.state = { email: '' }
    }
    render(){
        return (
            <div>
            {/* <link href="//cdn-images.mailchimp.com/embedcode/horizontal-slim-10_7.css" rel="stylesheet" type="text/css"/> */}
            {/* <style type="text/css">
                #mc_embed_signup{background:#fff; clear:left; font:14px Helvetica,Arial,sans-serif; width:100%;}
                Add your own Mailchimp form style overrides in your site stylesheet or in this style block.
                We recommend moving this block and the preceding CSS link to the HEAD of your HTML file.
            </style> */}
            <div id="mc_embed_signup">
                <MailChimpSubscribe 
                // url={URL}
                render={this.form}
                />
            </div>            
        </div>
        )
    }
    handleChange = (event) => {
        this.setState({ email: event.target.value })
    }
    submit = (subscribe) => async () => {
        const { email } = this.state, url = URL.concat(`&EMAIL=${email}`)
        function callback(res){
            console.log('res',res)
        }
        
        if (email && email.indexOf("@") > -1) {
            try {
                const res = await axios.get(url2, {
                    email_address: email,
                    status: 'subscribed',
                    apikey: key
                }, 
                )
                console.log('res',res)
                // subscribe({ EMAIL: email, })
            } catch (error) {
                console.log('error',error)
            }
        }
    }
    form = ({ subscribe, status, message }) => {
        return (
            <div style={{ flexDirection: 'column', }} >
                {/* <h2 style={{ fontFamily: 'lato' }} >Subscribe to my blog</h2> */}
                <form action="https://metoo.us16.list-manage.com/subscribe/post?u=83b8fc299ef72af629759350e&amp;id=c36bc8779a" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" class="validate" target="_blank" noValidate>
                    {/* <input type="email" className="email"  placeholder="Email" required onChange={this.handleChange} /> */}
                    <button class="submit" type="submit" /* onClick={this.submit(subscribe)} */ >
                        {/* Submit */} Subscribe to<br/>my blog
                    </button>
                </form>
                <div style={{ position: 'absolute', left: -5000 }} aria-hidden="true">
                    <input type="text" style={{ fontFamily: 'lato' }} name="b_83b8fc299ef72af629759350e_c36bc8779a" tabindex="-1" defaultValue=""/>
                </div>
            </div>
        )
    }
}