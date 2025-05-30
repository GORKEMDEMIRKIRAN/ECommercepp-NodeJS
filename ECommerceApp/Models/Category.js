



class Category{
    constructor(id,name,description){
        this.id=id;
        this._id=id;
        this.name=name;
        this.description=description;
    }

    toJSON(){
        return{
            id:this.id,
            name:this.name,
            description:this.description
        }
    }
}

module.exports=Category;