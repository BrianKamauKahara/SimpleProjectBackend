import { BadRequestError, ValidationError } from "../../models/Errors"
import { stripUndefinedFields, throwNonObjects, parseId, parseNoteData, parseNoteDataPartial, parseQuery } from "../../utils/controllerUtils"


describe('Utils: stripUndefinedFields and throwNonObjects', () => {
    // -- stripUndefinedFields
    describe('stripUndefinedFields', () => {
        it('removes keys with undefined values', () => {
            const input = { a: 1, b: undefined, c: 'hello', d: undefined }
            const expected = { a: 1, c: 'hello' }
            expect(stripUndefinedFields(input)).toEqual(expected)
        })

        it('leaves object unchanged if no undefined values', () => {
            const input = { a: 1, b: 2 }
            expect(stripUndefinedFields(input)).toEqual(input)
        })

        it('returns empty object if all values undefined', () => {
            const input = { a: undefined, b: undefined }
            expect(stripUndefinedFields(input)).toEqual({})
        })

        it('handles empty object', () => {
            const input = {}
            expect(stripUndefinedFields(input)).toEqual({})
        })
    })

    // -- throwNonObjects
    describe('throwNonObjects', () => {
        const invalidInputs = [null, undefined, 123, 'string', true, [], () => { }]
        invalidInputs.forEach(input => {
            it(`throws BadRequestError for invalid input (${JSON.stringify(input)})`, () => {
                expect(() => throwNonObjects(input)).toThrow(BadRequestError)
            })
        })

        it('returns the object if valid', () => {
            const obj = { title: 'Valid', content: 'Valid' }
            expect(throwNonObjects(obj)).toEqual(obj)
        })
    })
})

describe('parseId', () => {
    const invalidValues = [undefined, '', ['123'], '     '] // covers empty, empty, and array
    const validValues = ['1', 'note-id']

    // Test invalid IDs
    it.each(invalidValues)('throws BadRequestError if id is invalid (%p)', (val) => {
        expect(() => parseId(val as any)).toThrow(BadRequestError)
    })

    // Test valid IDs
    it.each(validValues)('returns string if id is valid (%p)', (val) => {
        expect(parseId(val)).toBe(val)
    })

})

describe('parseNoteData', () => {
    // -- General Body Test
    // Test invalid values of req.body
    const validValue = 'Valid'
    const invalidValues = [null, 123, true, []]
    it.each(invalidValues)('throws BadRequestError if req.body is of invalid type (%p)', (val) => {
        expect(() => parseNoteData(val)).toThrow(BadRequestError)
    })


    // -- Fields Tests
    const fields = ['title', 'content'] as const

    // 1. Test invalid keys: missing required keys or extra keys only
    const invalidKeys = [
        {}, // empty object
        { strangeKey: validValue }, // missing both required keys
        { title: validValue }, // missing 'content'
        { content: validValue }, // missing 'title'
    ]

    it.each(invalidKeys)(
        `throws ValidationError if keys of req.body are missing required fields (%p)`,
        (input) => {
            expect(() => parseNoteData(input)).toThrow(ValidationError)
        }
    )

    // 2. Test incorrect values of fields
    const invalidFieldValues = [null, 123, true, [], {}]
    fields.forEach(field => {
        it.each(invalidFieldValues)(`throws ValidationError if ${field} has invalid type  as (%p)`,
            (val) => {
                const input: Record<string, any> = { title: validValue, content: validValue }
                input[field] = val
                expect(() => parseNoteData(input)).toThrow(ValidationError)
            })
    })

    // 3. Test empty values
    const emptyValues = ['', '   ']
    fields.forEach(field => {
        it.each(emptyValues)(`throws ValidationError if ${field} is empty as (%p)`,
            (val) => {
                const input: Record<string, any> = { title: validValue, content: validValue }
                input[field] = val
                expect(() => parseNoteData(input)).toThrow(ValidationError)
            })
    })


    // -- Positive tests
    it('parses valid input correctly',
        () => {
            const validInput = { title: validValue, content: validValue }
            const result = parseNoteData(validInput)
            expect(result).toEqual(validInput)
        })

    it('strips unknown keys',
        () => {
            const input = { title: validValue, content: validValue, extra: 123 }
            const result = parseNoteData(input)
            expect(result).toEqual({ title: validValue, content: validValue })
        })
})

describe('parseNoteDataPartial', () => {
    /* Pretty Similar to above function */
    // -- General Body Test
    // Test invalid values of req.body
    const validValue: string = 'Valid'
    const invalidValues = [null, 123, true, [], {}, { 'Wrong Field Name': validValue }]

    it.each(invalidValues)('throws ValidationError if req.body is of invalid type (%p)',
        (val) => {
            expect(() => parseNoteDataPartial(val)).toThrow(ValidationError)
        })


    // -- Fields Tests
    const fields = ['title', 'content'] as const
    const invalidFieldValues = [null, 123, true, [], {}]

    // Test incorrect values of fields
    fields.forEach(field => {
        it.each(invalidFieldValues)(`throws ValidationError if ${field} has invalid type  as (%p)`,
            (val) => {
                const input: Record<string, any> = { title: validValue, content: validValue }
                input[field] = val
                expect(() => parseNoteDataPartial(input)).toThrow(ValidationError)
            })
    })

    // Test empty values
    const emptyValues = ['']
    fields.forEach(field => {
        it.each(emptyValues)(`throws ValidationError if ${field} is empty as (%p)`,
            (val) => {
                const input: Record<string, any> = { title: validValue, content: validValue }
                input[field] = val
                expect(() => parseNoteDataPartial(input)).toThrow(ValidationError)
            })
    })


    // -- Positive tests
    it('parses valid input correctly', () => {
        const validInput = { title: validValue, content: validValue }

        expect(parseNoteDataPartial(validInput)).toEqual(validInput)
    })

    fields.forEach(field => {
        it(`handles ${field} as undefined (strips it)`,
            () => {
                const input = { title: validValue, content: validValue } as Record<string, any>
                input[field] = undefined

                const expected = { ...input }
                delete expected[field]

                expect(parseNoteDataPartial(input)).toEqual(expected)
            })

        it(`allows ${field} to be missing`,
            () => {
                const input = { title: validValue, content: validValue } as Record<string, any>
                delete input[field]

                expect(parseNoteDataPartial(input)).toEqual(input)
            })
    })

    it('strips unknown keys',
        () => {
            const input = { title: validValue, content: validValue, extra: 123 }
            const result = parseNoteDataPartial(input)
            expect(result).toEqual({ title: validValue, content: validValue })
        })
})

describe('parseQuery', () => {

})