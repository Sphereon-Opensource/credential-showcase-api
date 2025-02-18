import { newAssetFrom, assetDTOFrom, replaceNullWithUndefined } from "./mappers"

describe('mappers', () => {
    describe('newAssetFrom', () => {    
        it('should return a new asset from an asset request', () => {
            const assetRequest = {
                mediaType: 'image/png',
                fileName: 'test.png',
                description: 'test description',
                content: 'test content'
            }

            const result = newAssetFrom(assetRequest)
            expect(result).toEqual({
                mediaType: 'image/png',
                fileName: 'test.png',
                description: 'test description',
                content: Buffer.from('test content')
            })
        })
    })

    describe('assetDTOFrom', () => {
        it('should return an asset DTO from an asset', () => {
            const asset = {
                id: '123',
                mediaType: 'image/png',
                fileName: 'test.png',
                description: 'test description',
                content: Buffer.from('test content')
            }

            const result = assetDTOFrom(asset)
            expect(result).toStrictEqual({
                id: '123',
                mediaType: 'image/png',
                fileName: 'test.png',
                description: 'test description',
                content: 'test content'
            })
        })  
    })    
    
    describe('replaceNullWithUndefined', () => {
        it('should replace null with undefined', () => {
            const result = replaceNullWithUndefined({ a: null, b: 'test' })
            expect(result).toStrictEqual({ a: undefined, b: 'test' })
        })
    
        it('should replace null with undefined in array', () => {
            const result = replaceNullWithUndefined([{ a: null, b: 'test' }])
            expect(result).toStrictEqual([{ a: undefined, b: 'test' }])
        })
    
        it('should replace null with undefined in object', () => {  
            const result = replaceNullWithUndefined({ a: { b: null } })
            expect(result).toStrictEqual({ a: { b: undefined } })
        })        
    })
})