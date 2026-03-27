import FireBaseModel from '../../models/FireBaseModel'
import { z } from 'zod'

const testSchema = z.object({
    name: z.string()
})

const instance = new FireBaseModel('valid', testSchema)

const mockCollection = {
    add: jest.fn(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    startAfter: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
}

const fakeDocs = [
    { exists: true, id: '1', data: () => ({ name: 'John' }) },
    { exists: true, id: '2', data: () => ({ name: 'Alice' }) }
] as const


jest.spyOn(instance as any, 'ref').mockReturnValue(mockCollection)

describe('FireBaseModel Constructor', () => {
    it('creates instances with valid inputs', () => {
        const instance = new FireBaseModel('valid', testSchema)

        expect(instance.collection).toBe('valid')
        expect(instance.schema).toBe(testSchema)
    })

    it.each([null, undefined, 123, true])(
        'throws for invalid collection: %p',
        (value) => {
            const schema = z.object({})

            expect(() => {
                new FireBaseModel(value as any, schema)
            }).toThrow('Invalid collection name')
        }
    )

    it.each([null, undefined, 123, {}, 'string'])(
        'throws for invalid schema: %p',
        (value) => {
            expect(() => {
                new FireBaseModel('collection', value as any)
            }).toThrow('Invalid Schema')
        }
    )

    it('rejects empty string collection', () => {
        const schema = z.object({})

        expect(() => {
            new FireBaseModel('  ', schema)
        }).toThrow('Invalid collection: cannot be an empty string')
    })
})

describe('findById', () => {
    it('returns formatted document', async () => {
        const fakeDoc = fakeDocs[0]

        jest.spyOn(instance as any, 'getDocOrThrow').mockResolvedValue(fakeDoc)

        const result = await instance.findById('123')

        expect(result).toEqual({ id: '123', ...fakeDoc.data() })
    })
})

describe('findAll', () => {
    it('returns a list of formatted doc types', async () => {
        mockCollection.get.mockResolvedValue({ docs: fakeDocs })

        const result = await instance.findAll({})

        expect(result.length).toBe(2)
    })
})