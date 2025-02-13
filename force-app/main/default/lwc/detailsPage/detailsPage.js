import { LightningElement, api, wire, track } from 'lwc';
import getPropertyImages from '@salesforce/apex/propertyController.getPropertyImages';
import getSimilarProperties from '@salesforce/apex/propertyController.getSimilarProperties';
import getUser from '@salesforce/apex/propertyController.getUser';
import id from '@salesforce/user/Id';
import createFavoritedProperty from '@salesforce/apex/propertyController.createFavoritedProperty';
import deleteFavoritedProperty from '@salesforce/apex/propertyController.deleteFavoritedProperty';
import getFavoritedState from '@salesforce/apex/propertyController.getFavoritedState';
import { refreshApex } from '@salesforce/apex';

export default class DetailsPage extends LightningElement {
    @api property = {};
    @api isUser;
    @track imageUrls = [];
    @track similarProperties;
    @track buttonState = false;
    wiredFavoriteStateResult;
    currUser;

    handleFavorite() {
        this.buttonState = !this.buttonState;
        if (this.buttonState) {
            createFavoritedProperty({ userId: this.userId, propertyId: this.property.Id })
                .then(() => refreshApex(this.wiredFavoriteStateResult))
                .catch(error => console.error('Error creating favorite:', error));
        } else {
            deleteFavoritedProperty({ userId: this.userId, propertyId: this.property.Id })
                .then(() => refreshApex(this.wiredFavoriteStateResult)) 
                .catch(error => console.error('Error deleting favorite:', error));
        }
    }

    get propertyId(){
        return this.property.Id;
    }

    get userId(){
        return id;
    }
    
    @wire(getFavoritedState, { userId: '$userId', propertyId: '$property.Id' })
    wiredFavoriteState(result) {
        this.wiredFavoriteStateResult = result;
        if (result.data !== undefined) {
            this.buttonState = result.data;
        } else if (result.error) {
            console.error('Error fetching favorited state:', result.error);
        }
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

    get propertyId() {
        return this.property ? this.property.Id : null;
    }

    @wire(getPropertyImages, { propertyId: '$propertyId' })
    wiredImageUrls({ data, error }) {
        this.imageUrls = [];
        if (data) {
            this.imageUrls = data;
            console.log('Image urls', JSON.stringify(this.imageUrls));
            console.log('Image url length', JSON.stringify(this.imageUrls.length))
        } else if (error) {
            console.error('Error fetching image:', error);
        }
    }

    @wire(getSimilarProperties, { propertyId: '$propertyId' })
    wiredSimilarProperties({ data, error }) {
        if (data) {
            this.similarProperties = data;
        } else if (error) {
            console.error('Error fetching image:', error);
        }
    }

    get mapMarkers() {
            return [{
                location: {
                    Street: this.property.Address__c.street,
                    City: this.property.Address__c.city,
                    State: this.property.Address__c.state,
                    Country: this.property.Address__c.country,
                    PostalCode: this.property.Address__c.postalCode
                },
                title: this.property.Name
            }];
    }

    get mapOptions(){
        return {
            zoomControl: true, 
            mapTypeControl: true, 
            fullscreenControl: false, 
            streetViewControl: false,
        };
    }

    get featuresList(){
        return this.property?.Features__c ? this.property.Features__c.split(';') : [];
    }

    handleChildMessage(event) {
        this.dispatchEvent(new CustomEvent('parentmessage', {
            detail: { property: event.detail.prop }
        }))
    }
    
}