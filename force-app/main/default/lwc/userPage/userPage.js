 import { LightningElement, wire, track } from 'lwc';
 import PROFILE_ICON from '@salesforce/resourceUrl/astro'
 import getUser from '@salesforce/apex/propertyController.getUser';
 import id from '@salesforce/user/Id';
 import getFavoritedProperties from '@salesforce/apex/propertyController.getFavoritedProperties';
 import { refreshApex } from '@salesforce/apex';

export default class UserPage extends LightningElement {
    profileUrl = PROFILE_ICON;
    currUser;
    @track wiredFavoriteResult = {};
    favoritedList;

    @wire(getFavoritedProperties, { userId: '$userId' })
    wiredFavoritedList(result) {
        this.wiredFavoriteListResult = result;
        if (result.data !== undefined) {
            this.favoritedList = result.data;
            console.log('favorited list stuff', JSON.stringify(this.favoritedList));
        } else if (result.error) {
            console.error('Error fetching favorited state:', result.error);
        }
    }

    get isListEmpty(){
        if(this.favoritedList.length == 0){
            return true;
        }
        else{
            return false;
        }
    }

    renderedCallback(){
        refreshApex(this.wiredFavoriteListResult);
    }

    get userId(){
        return id;
    }

    @wire(getUser, { userId: '$userId' })
    wireCurrUser({ data, error }) {
        if (data) {
            this.isUser = true;
            this.isGuest = false;
            this.currUser = data;
            console.log('Data about user: ', JSON.stringify(data));
        } else if (error) {
            console.error('Error fetching image:', error);
        }
    }

    handleChildMessage(event) {
        this.dispatchEvent(new CustomEvent('parentmessage', {
            detail: { property: event.detail.prop }
        }))
    }
}