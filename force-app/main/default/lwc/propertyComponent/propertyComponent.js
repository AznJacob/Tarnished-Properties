import { LightningElement, api, wire } from 'lwc';
import getPropertyImage from '@salesforce/apex/propertyController.getPropertyImage';

export default class PropertyComponent extends LightningElement {
    @api property;
    imageUrl;
    title = '';

    get propertyId() {
        return this.property ? this.property.Id : null;
    }

    @wire(getPropertyImage, { propertyId: '$propertyId' })
    wiredImageUrl({ data, error }) {
        if (data) {
            this.imageUrl = data;
        } else if (error) {
            console.error('Error fetching image:', error);
        }
    }

    renderedCallback(){
        this.title = this.property.Address__c.street + ', ' + this.property.Address__c.city + ', ' + this.property.Address__c.state + ', ' + this.property.Address__c.postalCode;
    }

    handleClick(){
        this.dispatchEvent(new CustomEvent('childmessage', {
            detail: { prop: this.property }
        }))
    }
}