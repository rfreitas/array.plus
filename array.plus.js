//Compatible with Ember and dependent on underscore

/*global Ember:true,Em:true,,_:true,window:true,_:true*/

function nextObjectIndexAfter(index,array){
	for (var i = index+1; i< array.length; i++){
		var value = array[i];
		if (typeof value !== "undefined"){
			return i;
		}
	}
}
Array.prototype.nextObjectIndexAfter = function(index){
	return nextObjectIndexAfter(index,this);
};

Array.prototype.nextObjectAfter = function(index){
	return this[nextObjectIndexAfter(index,this)];
};

//the next object index after the first occurence of value
Array.prototype.nextObjectIndexAfterValue= function(value){
	var index = this.indexOf(value);
	return this.nextObjectIndexAfter(index);
};


function isInt(n) {
   return n % 1 === 0;
}

function isNatural(n){
	return isInt(n) && n >= 0;
}


(function(window,Array,Ember){
	
	//function to increase compatability with other frameworks or abscence of them
	
	//test wheter array has a getter for length
	var hasLenGetter = function hasLenGetter(){
		var test = [];
		if (typeof test.get !== "function") return false;
		var len = 3;
		test.length = len;
		return test.get("length") === len;
	};

	var lengthOf;
	if (hasLenGetter()){
		lengthOf = function(array){
			return array.get("length");
		};
	}
	else{
		lengthOf = function(array){
			return array.length;
		};
	}

	
	var arrayUtils = window.arrayUtils ={};


	//queries
	var countObjects = arrayUtils.countObjects = function(array){
		var count = 0;
		array.forEach(function(){
			count += 1;
		});
		return count;
	};

	var isFirst = arrayUtils.isFirst = function(array,value){
		var index = array.indexOf(value);
		return index === 0;
	};

	var isLast = arrayUtils.isLast = function(array,value){
		var index = array.indexOf(value);
		return lengthOf(array)-1 === index;
	};


	//calculated queries
		var sum = arrayUtils.sum = function(array){
			return array.reduce( function(memo,num){
				return memo+num;
			}, 0);
		};

		//why not wrapped only? you could have want to implement wrappedValueIndex
		var wrappedIndex = arrayUtils.wrappedIndex = function(arrayOrLength,index){
			console.log("index:"+index);
			var length = isNatural(arrayOrLength) ? arrayOrLength : lengthOf(arrayOrLength);
			console.log("length:"+length);
			if (index < 0){
				index = length + (index+1)%length-1;
			}
			else{
				index = index%length;
			}
			console.log("wrapped index:"+index);
			return index;
		};

		var boundedIndex = arrayUtils.boundedIndex = function(array,index){
			var length = lengthOf(array);
			if (length === 0) throw "Array is empty, therefore has no bounds";

			if (index < 0){
				return 0;
			}
			else if (index > length){
				return length - 1;
			}
			return index;
		};

		//why not isIndexOutOfBounds? Simple, an isValueOutOfBounds methods is already
		//implemented with "value in array" or array.hasOwnProperty(value)
		var isOutOfBounds = arrayUtils.isOutOfBounds = function(array,index){
			return index < 0 || index >= lengthOf(array);
		};

		//convenience method to return the wrapped index or raise an exception in case of invalid index
		var wrappedIndexOnlyIf = arrayUtils.wrappedIndexOnlyIf = function(array,index,wrap){
			if (wrap) return wrappedIndex(array,index);
			else if(isOutOfBounds(array, index)){
				throw "Index out of bounds or invalid";
			}
		};


		var wrappedIndexOrBounded = arrayUtils.wrappedIndexOrBounded = function(array,index,wrap){
			if (wrap) return wrappedIndex(array,index);
			else return boundedIndex(array,index);
		};


	var extension = window.ArrayExtension = {};//prototype extension

	//adds methods
	_.each(arrayUtils, function(value,key){
		extension[key] = function(){
			var args = _.toArray(arguments);
			args.unshift(this);
			return value.apply(null,args);
		};
	});

	
	//Extending
	if (Ember){
		//assert(Ember.Mixin && Ember.Mixin.create, "This Ember version does not seem to support Mixins");
		var ArrayExtensionMixin = Ember.ArrayExtension = Ember.Mixin.create(extension);
		ArrayExtensionMixin.apply(Array.prototype);
		Ember.ArrayProxy.reopen(ArrayExtensionMixin);
	}
	else{
		_.extend(Array.prototype,extension);
	}

})(window,Array,Ember);

