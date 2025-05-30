



class Product{
    constructor(id,name,brand,price,description,imageUrl,categories){
        this.id=id;
        this.name=name;
        this.brand=brand;
        this.price=price;
        this.description=description;
        this.imageUrl=imageUrl;
        this.categories=categories;
    }
    toJSON(){
        return{
            id:this.id,
            name:this.name,
            brand:this.brand,
            price:this.price,
            description:this.description,
            imageUrl:this.imageUrl,
            categories:this.categories
        }
    }
}
module.exports=Product;