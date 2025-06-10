



class Product{
    constructor(id,name,brand,price,description,imageUrl,categoryIds,isActive,tags,userId){
        this.id=id;
        this.name=name;
        this.brand=brand;
        this.price=price;
        this.description=description;
        this.imageUrl=imageUrl;
        // categoryIds güvenli kontrolü
        if (Array.isArray(categoryIds)) {
            this.categories = [...categoryIds];
        } else if (categoryIds) {
            this.categories = [categoryIds]; // Tek kategori
        } else {
            this.categories = []; // Boş array
        }
        this.isActive=isActive;
        this.tags=tags || [];
        this.userId=userId;
    }
    toJSON(){
        return{
            id:this.id,
            name:this.name,
            brand:this.brand,
            price:this.price,
            description:this.description,
            imageUrl:this.imageUrl,
            categories:this.categories,
            isActive:this.isActive,
            tags:this.tags,
            userId:this.userId
        }
    }
}
module.exports=Product;