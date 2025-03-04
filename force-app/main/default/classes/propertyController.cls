public with sharing class propertyController {
    public propertyController() {

    }

    @AuraEnabled(cacheable=true)
    public static List<Property__c> getAllProperties(){
        return [SELECT Name, Address__c, Bathrooms__c, Bedrooms__c, Features__c, Price__c, Property_Type__c, Square_Feet__c, Description__c FROM Property__c];
    }

    @AuraEnabled(cacheable=true)
    public static List<Property__c> getFeaturedProperties(){
        return [SELECT Name, Address__c, Bathrooms__c, Bedrooms__c, Features__c, Price__c, Property_Type__c, Square_Feet__c, Description__c FROM Property__c LIMIT 5];
    }

    @AuraEnabled(cacheable=true)
    public static String getPropertyImage(Id propertyId) {

        ContentDocumentLink link = [ 
            SELECT ContentDocumentId 
            FROM ContentDocumentLink 
            WHERE LinkedEntityId = :propertyId 
            LIMIT 1
        ];

        ContentVersion version = [
            SELECT Id, ContentDocumentId, VersionData 
            FROM ContentVersion 
            WHERE ContentDocumentId = :link.ContentDocumentId 
            ORDER BY CreatedDate DESC 
            LIMIT 1
        ];

         return '/sfc/servlet.shepherd/document/download/' + version.ContentDocumentId;
    }

    @AuraEnabled(cacheable=true)
    public static List<String> getPropertyImages(Id propertyId) {

        List<ContentDocumentLink> links = [ 
            SELECT ContentDocumentId 
            FROM ContentDocumentLink 
            WHERE LinkedEntityId = :propertyId 
        ];

        Set<Id> contentDocumentIds = new Set<Id>();
        for (ContentDocumentLink link : links) {
            contentDocumentIds.add(link.ContentDocumentId);
        }

        List<ContentVersion> versions = [
            SELECT Id, ContentDocumentId 
            FROM ContentVersion 
            WHERE ContentDocumentId IN :contentDocumentIds 
            AND IsLatest = true 
        ];

        List<String> imageUrls = new List<String>();
        for (ContentVersion version : versions) {
            String downloadUrl = '/sfc/servlet.shepherd/document/download/' + version.ContentDocumentId;
            imageUrls.add(downloadUrl);
        }

        return imageUrls;
    }

    public static String getSecretKey(String keyName){
        Secret_Key__mdt keyRecord = [
            SELECT Secret_Value__c 
            FROM Secret_Keys__mdt 
            WHERE DeveloperName = :keyName
            LIMIT 1
        ];
        return keyRecord.Secret_Value__c;
    }

    @AuraEnabled
    public static List<Property__c> searchProperty(String address){
        String apiKey = getSecretKey('SecretAPIKey');
        String encodedAddress = EncodingUtil.urlEncode(address, 'UTF-8');

        Http http = new Http();
        HttpRequest request = new HttpRequest();
        request.setEndpoint('https://api.geoapify.com/v1/geocode/search?text=' + encodedAddress + '&apiKey=' + apiKey);
        request.setMethod('GET');
        HttpResponse response = http.send(request);

        if(response.getStatusCode() == 200){
            Map<String, Object> result = (Map<String, Object>)JSON.deserializeUntyped(response.getBody());
            List<Object> features = (List<Object>) result.get('features');
            Map<String, Object> firstFeature = (Map<String, Object>) features[0];
            Map<String, Object> geometry = (Map<String, Object>) firstFeature.get('properties');
            
            Decimal latitude = (Decimal) geometry.get('lat');
            Decimal longitude = (Decimal) geometry.get('lon');

            List<Property__c> properties = [SELECT Name, Address__c, Bathrooms__c, Bedrooms__c, Features__c, Price__c, Property_Type__c, Square_Feet__c, Description__c FROM Property__c 
                                            WHERE DISTANCE(Geolocation__c, GEOLOCATION(:latitude,:longitude), 'mi') < 50 ORDER BY DISTANCE(Geolocation__c, GEOLOCATION(:latitude,:longitude), 'mi') 
                                            LIMIT 3];
            return properties;
        }
        else{
            throw new AuraHandledException('Error with respone code: ' + response.getStatusCode());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Property__c> getFilteredProperties(String homeType, String minBedrooms, String minBathrooms, Integer startingPrice, Integer endingPrice, String features, String sortingType, String sortingOrder){
        String query = 'SELECT Name, Address__c, Bathrooms__c, Bedrooms__c, Features__c, Price__c, Property_Type__c, Square_Feet__c, Description__c FROM Property__c WHERE Name != null';

        if (homeType != 'Any' && String.isNotBlank(homeType)) {
             query += ' AND Property_Type__c = :homeType';
        }
        if(String.isNotBlank(features)){
            query += ' AND Features__c includes (:features)';
        }
        Integer minBedroomsInt = Integer.valueOf(minBedrooms);
        query += ' AND Bedrooms__c >= :minBedroomsInt';        
        Integer minBathroomsInt = Integer.valueOf(minBathrooms);
        query += ' AND Bathrooms__c >= :minBathroomsInt';

        query += ' AND Price__c >= :startingPrice';
        query += ' AND Price__c <= :endingPrice';
        if(String.isNotBlank(sortingType) && String.isNotBlank(sortingOrder)){
            query += ' ORDER BY ' + sortingType + ' ' + sortingOrder;
        }
        query += ' LIMIT 12';

        return Database.query(query);
    }

    @AuraEnabled(cacheable=true)
    public static List<Property__c> getSimilarProperties(Id propertyId){
        Property__c prop = [SELECT Geolocation__c FROM Property__c WHERE Id = :propertyId];
        return [SELECT Name, Address__c, Bathrooms__c, Bedrooms__c, Features__c, Price__c, 
            Property_Type__c, Square_Feet__c, Description__c FROM Property__c WHERE 
            Id != :propertyId AND (DISTANCE(Geolocation__c, :prop.Geolocation__c, 'mi') < 50) 
            ORDER BY DISTANCE(Geolocation__c, :prop.Geolocation__c, 'mi')LIMIT 3];
    }

    @AuraEnabled(cacheable=true)
    public static User getUser(Id userId){
        return [SELECT Id, FirstName, LastName, MediumPhotoUrl, Email FROM User WHERE Id = :userId];
    }

    @AuraEnabled
    public static void createFavoritedProperty(Id userId, Id propertyId){
        List<Favorited_Property__c> existingFavorites = [
        SELECT Id FROM Favorited_Property__c
        WHERE User__c = :userId AND Property__c = :propertyId];

        if(existingFavorites.isEmpty()){
            User currUser = [SELECT Id, Name FROM User WHERE Id = :userId];
            Property__c currProp = [SELECT Id, Name FROM Property__c WHERE Id = :propertyId];
            Favorited_Property__c favoritedProperty = new Favorited_Property__c();
            favoritedProperty.Name = currUser.Name + ' favorited ' + currProp.Name;
            favoritedProperty.User__c = userId;
            favoritedProperty.Property__c = propertyId;

            insert favoritedProperty;
        }
    }

    @AuraEnabled
    public static void deleteFavoritedProperty(Id userId, Id propertyId){
        List<Favorited_Property__c> existingFavorites = [
        SELECT Id FROM Favorited_Property__c
        WHERE User__c = :userId AND Property__c = :propertyId];

        if(!existingFavorites.isEmpty()){
            delete existingFavorites;
        }
    }

    @AuraEnabled(cacheable=true)
    public static Boolean getFavoritedState(Id userId, Id propertyId){
        List<Favorited_Property__c> existingFavorites = [
        SELECT Id FROM Favorited_Property__c
        WHERE User__c = :userId AND Property__c = :propertyId];

        if(existingFavorites.isEmpty()){
            return false;
        }
        else{
            return true;
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<Property__c> getFavoritedProperties(Id userId){
        List<Favorited_Property__c> favoritedProperties = [SELECT Property__c FROM Favorited_Property__c WHERE User__c = :userId];

        List<Id> propertyIds = new List<Id>();
        for (Favorited_Property__c fp : favoritedProperties) {
            propertyIds.add(fp.Property__c);
        }

        return [SELECT Name, Address__c, Bathrooms__c, Bedrooms__c, Features__c, Price__c, Property_Type__c, Square_Feet__c, Description__c FROM Property__c WHERE Id IN :propertyIds]; 
    }
}

    
