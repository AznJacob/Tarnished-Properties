import { LightningElement, track, wire } from 'lwc';
import COMPANY_LOGO from '@salesforce/resourceUrl/NewLogo'
import getUser from '@salesforce/apex/propertyController.getUser';
import id from '@salesforce/user/Id';
export default class MainApp extends LightningElement {
    logoUrl = COMPANY_LOGO;

    homeRender = true;
    listingRender = false;
    detailsRender = false;
    userRender = false;

    isUser = false;
    isGuest = true;

    @track currUser;

    get userId(){
        return id;
    }

    @wire(getUser, { userId: '$userId' })
    wireCurrUser({ data, error }) {
        if (data) {
            this.isUser = true;
            this.isGuest = false;
            this.currUser = data;
            //console.log('Data about user: ', JSON.stringify(data));
        } else if (error) {
            console.error('Error fetching image:', error);
        }
    }

    @track detailsProperty = {};

    changeToHome(){
        this.listingRender = false;
        this.homeRender = true;
        this.detailsRender = false;
        this.userRender = false;
    }

    changeToListing(){
        this.detailsRender = false;
        this.homeRender = false;
        this.listingRender = true;
        this.userRender = false;
    }

    changeToDetails(){
        this.detailsRender = true;
        this.homeRender = false;
        this.listingRender = false;
        this.userRender = false;
    }

    changeToUser(){
        this.userRender = true;
        this.detailsRender = false;
        this.homeRender = false;
        this.listingRender = false;
    }

    handleParentMessage(event){
        this.detailsProperty = event.detail.property;
        this.changeToDetails();
    }
}