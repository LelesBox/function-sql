const chai = require('chai')
const assert = chai.assert
const query = require('./function-sql')

describe('SQL tests', () => {
  it('Basic SELECT tests', () => {
    var numbers = [1, 2, 3]
    assert.deepEqual(query().select().from(numbers).execute(), numbers)
    assert.deepEqual(query().select().execute(), [], 'No FROM clause produces empty array')
    assert.deepEqual(query().from(numbers).execute(), numbers, 'SELECT can be omited')
    assert.deepEqual(query().execute(), [])
    assert.deepEqual(query().from(numbers).select().execute(), numbers, 'The order does not matter')
  })

  it("Basic SELECT and WHERE over objects", function() {
    var persons = [
      {name: 'Peter', profession: 'teacher', age: 20, maritalStatus: 'married'},
      {name: 'Michael', profession: 'teacher', age: 50, maritalStatus: 'single'},
      {name: 'Peter', profession: 'teacher', age: 20, maritalStatus: 'married'},
      {name: 'Anna', profession: 'scientific', age: 20, maritalStatus: 'married'},
      {name: 'Rose', profession: 'scientific', age: 50, maritalStatus: 'married'},
      {name: 'Anna', profession: 'scientific', age: 20, maritalStatus: 'single'},
      {name: 'Anna', profession: 'politician', age: 50, maritalStatus: 'married'}
    ];

    assert.deepEqual(query().select().from(persons).execute(), persons);

    function profession(person) {
      return person.profession;
    }

    //SELECT profession FROM persons
    assert.deepEqual(query().select(profession).from(persons).execute(),  ["teacher","teacher","teacher","scientific","scientific","scientific","politician"]);
    assert.deepEqual(query().select(profession).execute(), [], 'No FROM clause produces empty array');


    function isTeacher(person) {
      return person.profession === 'teacher';
    }
    //
    // //SELECT profession FROM persons WHERE profession="teacher"
    assert.deepEqual(query().select(profession).from(persons).where(isTeacher).execute(), ["teacher", "teacher", "teacher"]);
    //
    //
    // //SELECT * FROM persons WHERE profession="teacher"
    assert.deepEqual(query().from(persons).where(isTeacher).execute(), persons.slice(0, 3));
    //
    function name(person) {
      return person.name;
    }
    //
    // //SELECT name FROM persons WHERE profession="teacher"
    assert.deepEqual(query().select(name).from(persons).where(isTeacher).execute(), ["Peter", "Michael", "Peter"]);
    assert.deepEqual(query().where(isTeacher).from(persons).select(name).execute(), ["Peter", "Michael", "Peter"]);
  })

  it('Numbers tests', function() {

    function isEven(number) {
      return number % 2 === 0;
    }

    function parity(number) {
      return isEven(number) ? 'even' : 'odd';
    }

    function isPrime(number) {
      if (number < 2) {
        return false;
      }
      var divisor = 2;
      for(; number % divisor !== 0; divisor++);
      return divisor === number;
    }

    function prime(number) {
      return isPrime(number) ? 'prime' : 'divisible';
    }

    var numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    //SELECT * FROM numbers
    assert.deepEqual(query().select().from(numbers).execute(), numbers);

    //SELECT * FROM numbers GROUP BY parity
    assert.deepEqual(query().select().from(numbers).groupBy(parity).execute(), [["odd",[1,3,5,7,9]],["even",[2,4,6,8]]]);

    //SELECT * FROM numbers GROUP BY parity, isPrime
    assert.deepEqual(query().select().from(numbers).groupBy(parity, prime).execute(), [["odd",[["divisible",[1,9]],["prime",[3,5,7]]]],["even",[["prime",[2]],["divisible",[4,6,8]]]]]);

    function odd(group) {
      return group[0] === 'odd';
    }

    //SELECT * FROM numbers GROUP BY parity HAVING
    // assert.deepEqual(query().select().from(numbers).groupBy(parity).having(odd).execute(), [["odd",[1,3,5,7,9]]]);

    function descendentCompare(number1, number2) {
      return number2 - number1;
    }

    //SELECT * FROM numbers ORDER BY value DESC
  //  assert.deepEqual(query().select().from(numbers).orderBy(descendentCompare).execute(), [9,8,7,6,5,4,3,2,1]);

    function lessThan3(number) {
      return number < 3;
    }

    function greaterThan4(number) {
      return number > 4;
    }

    //SELECT * FROM number WHERE number < 3 OR number > 4
    // assert.deepEqual(query().select().from(numbers).where(lessThan3, greaterThan4).execute(),  [1,2,5,6,7,8,9]);
  })
})
