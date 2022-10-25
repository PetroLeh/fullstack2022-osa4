const listHelper = require('../utils/list_helper')
const { emptyList, listWithOneBlog, listWithManyBlogs } = require('./test_helper')

describe('total likes', () => {

    test('of empty list is zero', () => {
        expect(listHelper.totalLikes(emptyList)).toBe(0)
    })
    test('when list has only one blog equals the likes of that', () => {
        expect(listHelper.totalLikes(listWithOneBlog)).toBe(2)
    })
    test('of a bigger list is calculated right', () => {
        expect(listHelper.totalLikes(listWithManyBlogs)).toBe(36)
    })

    describe('favorite blog', () => {
        test('of an empty list is null', () => {
            expect(listHelper.favoriteBlog(emptyList)).toBe(null)
        })
        test('of a list with one blog is the only blog of the list', () => {
            expect(listHelper.favoriteBlog(listWithOneBlog)).toEqual({
                title: 'test',
                author: 'tester',
                likes: 2
            })
        })
        test('of a list with many blogs is the blog with most likes', () => {
            expect(listHelper.favoriteBlog(listWithManyBlogs)).toEqual({
                title: 'Canonical string reduction',
                author: 'Edsger W. Dijkstra',
                likes: 12
            })
        })
    })
})