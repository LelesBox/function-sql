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
    assert.deepEqual(query().select().from(numbers).groupBy(parity).having(odd).execute(), [["odd",[1,3,5,7,9]]]);

    function descendentCompare(number1, number2) {
      return number2 - number1;
    }

    //SELECT * FROM numbers ORDER BY value DESC
   assert.deepEqual(query().select().from(numbers).orderBy(descendentCompare).execute(), [9,8,7,6,5,4,3,2,1]);

    function lessThan3(number) {
      return number < 3;
    }

    function greaterThan4(number) {
      return number > 4;
    }

    //SELECT * FROM number WHERE number < 3 OR number > 4
    assert.deepEqual(query().select().from(numbers).where(lessThan3, greaterThan4).execute(),  [1,2,5,6,7,8,9]);
  })

  it('Frequency tests', function() {

    var persons = [
      ['Peter', 3],
      ['Anna', 4],
      ['Peter', 7],
      ['Michael', 10]
    ];

    function nameGrouping(person) {
      return person[0];
    }

    function sumValues(value) {
      return [value[0], value[1].reduce(function(result, person) {
        return result + person[1];
      }, 0)];
    }

    function naturalCompare(value1, value2) {
      if (value1 < value2) {
        return -1;
      } else if (value1 > value2) {
        return 1;
      } else {
        return 0;
      }
    }
    //SELECT name, sum(value) FROM persons ORDER BY naturalCompare GROUP BY nameGrouping
    assert.deepEqual(query().select(sumValues).from(persons).orderBy(naturalCompare).groupBy(nameGrouping).execute(),  [["Anna",4],["Michael",10],["Peter",10]]);

    var numbers = [1, 2, 1, 3, 5, 6, 1, 2, 5, 6];

    function id(value) {
      return value;
    }

    function frequency(group) {
      return { value: group[0], frequency: group[1].length };
    }

    //SELECT number, count(number) FROM numbers GROUP BY number
    assert.deepEqual(query().select(frequency).from(numbers).groupBy(id).execute(), [{"value":1,"frequency":3},{"value":2,"frequency":2},{"value":3,"frequency":1},{"value":5,"frequency":2},{"value":6,"frequency":2}]);

    function greatThan1(group) {
      return group[1].length > 1;
    }

    function isPair(group) {
      return group[0] % 2 === 0;
    }

    //SELECT number, count(number) FROM numbers GROUP BY number HAVING count(number) > 1 AND isPair(number)
    assert.deepEqual(query().select(frequency).from(numbers).groupBy(id).having(greatThan1).having(isPair).execute(),  [{"value":2,"frequency":2},{"value":6,"frequency":2}]);
  })

  it('join tests', function() {
    var teachers = [
      {
        teacherId: '1',
        teacherName: 'Peter'
      },
      {
        teacherId: '2',
        teacherName: 'Anna'
      }
    ];


    var students = [
      {
        studentName: 'Michael',
        tutor: '1'
      },
      {
        studentName: 'Rose',
        tutor: '2'
      }
    ];

    function teacherJoin(join) {
      return join[0].teacherId === join[1].tutor;
    }

    function student(join) {
      return {studentName: join[1].studentName, teacherName: join[0].teacherName};
    }

    //SELECT studentName, teacherName FROM teachers, students WHERE teachers.teacherId = students.tutor
    assert.deepEqual(query().select(student).from(teachers, students).where(teacherJoin).execute(), [{"studentName":"Michael","teacherName":"Peter"},{"studentName":"Rose","teacherName":"Anna"}]);


    var numbers1 = [1, 2];
    var numbers2 = [4, 5];

    assert.deepEqual(query().select().from(numbers1, numbers2).execute(), [[1,4],[1,5],[2,4],[2,5]]);

    function tutor1(join) {
      return join[1].tutor === "1";
    }

    //SELECT studentName, teacherName FROM teachers, students WHERE teachers.teacherId = students.tutor AND tutor = 1
    assert.deepEqual(query().select(student).from(teachers, students).where(teacherJoin).where(tutor1).execute(), [{"studentName":"Michael","teacherName":"Peter"}]);
  })

  it('Duplication exception tests', function() {
    function checkError(fn, duplicate) {
      try {
        fn();
      } catch (e) {
        assert.equal(e instanceof Error, true);
        assert.equal(e.message, 'Duplicate ' + duplicate);
      }
    }


    function id(value) {
      return value;
    }

    checkError(function() { query().select().select().execute(); }, 'SELECT');
    checkError(function() { query().select().from([]).select().execute(); }, 'SELECT');
    checkError(function() { query().select().from([]).from([]).execute(); }, 'FROM');
    checkError(function() { query().select().from([]).orderBy(id).orderBy(id).execute(); }, 'ORDERBY');
    checkError(function() { query().select().groupBy(id).from([]).groupBy(id).execute(); }, 'GROUPBY');

  })
})
