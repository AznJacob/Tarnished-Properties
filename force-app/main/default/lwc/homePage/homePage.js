import { LightningElement, wire, track, api } from 'lwc';
import searchProperty from '@salesforce/apex/propertyController.searchProperty';
import getFeaturedProperties from '@salesforce/apex/propertyController.getFeaturedProperties';

export default class HomePage extends LightningElement {
    @wire(getFeaturedProperties)
    propList;

    @track
    searchedList;

    searchInput = '';
    handleSearch(){
        this.searchInput = this.template.querySelector('input').value;
        searchProperty({address: this.searchInput})
            .then((result) => {
                this.searchedList = result;
                //console.log('Search Results:', this.searchedList);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    // Carousel stuff
    currentIndex = 0;

    get slideStyle() {
        return `transform: translateX(-${this.currentIndex * 100}%);`;
    }

    nextSlide() {
        if (this.currentIndex < this.propList.data.length - 1) {
            this.currentIndex++;
        } else {
            this.currentIndex = 0;
        }
    }

    previousSlide() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
        } else {
            this.currentIndex = this.propList.data.length - 1;
        }
    }

    handleChildMessage(event) {
        this.dispatchEvent(new CustomEvent('parentmessage', {
            detail: { property: event.detail.prop }
        }))
    }
}