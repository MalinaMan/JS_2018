class Animal {
	constructor(name) {
		this.name = name;
	}
	getName() {
		return this.name;
    }
}

class Dog extends Animal {
	constructor(...args) {
		super(...args);
	}
	bark() {
		return `Dog ${this.name} is barking`;
    }
}


let dog = new Dog('Aban');

console.log(dog.getName());
console.log(dog.bark());