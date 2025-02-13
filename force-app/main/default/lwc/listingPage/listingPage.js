import { LightningElement, wire, track, api } from 'lwc';
import getFilteredProperties from '@salesforce/apex/propertyController.getFilteredProperties';

export default class ListingPage extends LightningElement { 
    @wire(getFilteredProperties, { homeType: '$homeValue', 
        minBedrooms: '$bedroomValue', 
        minBathrooms: '$bathroomValue', 
        startingPrice: '$startPrice', 
        endingPrice: '$endPrice',
        features: '$featureValue',
        sortingType: '$sortTypeValue',
        sortingOrder: '$sortOrderValue' })
    filteredProperties;

    startPrice = 0;
    endPrice = 10000;
    @track featureArray = [];
    homeValue = 'Any';
    bedroomValue = '1';
    bathroomValue = '1';
    featureValue = '';
    sortTypeValue = '';
    sortOrderValue = '';

    get homeOptions() {
        return [
            { label: 'Any Type', value: 'Any'},
            { label: 'House', value: 'House' },
            { label: 'Apartment', value: 'Apartment' },
            { label: 'Condo', value: 'Condo' }
        ];
    }

    get bedroomOptions() {
        return [
            { label: '1+ bd', value: '1'},
            { label: '2+ bd', value: '2' },
            { label: '3+ bd', value: '3' },
            { label: '4+ bd', value: '4' },
        ];
    }

    get bathroomOptions() {
        return [
            { label: '1+ ba', value: '1'},
            { label: '2+ ba', value: '2' },
            { label: '3+ ba', value: '3' },
            { label: '4+ ba', value: '4' },
        ];
    }

    get featureOptions() {
        return [
            { label: 'Pool', value: 'Pool' },
            { label: 'Pet-Friendly', value: 'Pet-Friendly' },
            { label: 'Furnished', value: 'Furnished' },
            { label: 'In-unit Laundry', value: 'In-unit Laundry' },
            { label: 'Garage', value: 'Garage' },
            { label: 'High Speed Internet', value: 'High Speed Internet' },
        ];
    }

    get sortTypeOptions() {
        return [
            { label: 'Price', value: 'Price__c'},
            { label: 'Beds', value: 'Bedrooms__c' },
            { label: 'Baths', value: 'Bathrooms__c' },
            { label: 'sqft.', value: 'Square_Feet__c' },
        ];
    }

    get sortOrderOptions() {
        return [
            { label: 'Low to high', value: 'ASC'},
            { label: 'High to low', value: 'DESC' },
        ];
    }
    
    handleHomeChange(event) {
        this.homeValue = event.detail.value;
    }

    handleBedroomChange(event) {
        this.bedroomValue = event.detail.value;
    }

    handleBathroomChange(event) {
        this.bathroomValue = event.detail.value;
    }

    handleFeatureChange(event) {
        this.featureArray = event.detail.value;
        this.featureValue = this.featureArray.join(';');
    }

    handleChange(event){
        this.startPrice = event.detail.start;
        this.endPrice = event.detail.end;
    }

    handleSortTypeChange(event){
        this.sortTypeValue = event.detail.value;
    }

    handleSortOrderChange(event){
        this.sortOrderValue = event.detail.value;
    }

    handleChildMessage(event) {
        this.dispatchEvent(new CustomEvent('parentmessage', {
            detail: { property: event.detail.prop }
        }))
    }
    //getlistrecordsbyname does not return proper format i need
    /*
    @track filterValues = {};

    @wire(getListRecordsByName, {
        objectApiName: PROPERTY_OBJECT.objectApiName,
        listViewApiName: "All_Properties",
        fields: ["Property__c.Name", 
                "Property__c.Address__c", 
                "Property__c.Bedrooms__c", 
                "Property__c.Bathrooms__c", 
                "Property__c.Price__c", 
                "Property__c.Property_Type__c", 
                "Property__c.Square_Feet__c"],
        pageSize: 9  
    })filteredProperties;

    handleFilters(){
        let filters = [];
        if(this.homeValue){
            filters.push({Property_Type__c: { eq: this.homeValue}});
        }
       if(this.bedroomValue){
            filters.push({Bedrooms__c: { gte: parseInt(this.bedroomValue)}});
        }
        if(this.bedroomValue){
        filters.push({Bedrooms__c: { gte: parseInt(this.bedroomValue)}});
        }

        return filters.length ? { and: filters } : {};
    }

    get propList(){
        console.log('Proplist: ', JSON.stringify(this.filteredProperties.data.records));
        return this.filteredProperties.data.records;
    }
        */
}