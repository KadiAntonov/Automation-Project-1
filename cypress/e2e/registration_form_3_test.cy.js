beforeEach(() => {
    cy.visit('cypress/fixtures/registration_form_3.html')
})

/*
BONUS TASK: add visual tests for registration form 3
Task list:
* Create test suite for visual tests for registration form 3 (describe block)
* Create tests to verify visual parts of the page:
    * radio buttons and its content
    * dropdown and dependencies between 2 dropdowns:
        * list of cities changes depending on the choice of country
        * if city is already chosen and country is updated, then city choice should be removed
    * checkboxes, their content and links
    * email format
 */
describe('Visual tests for registration form 3', () => {
    it('Check that radio button list is correct', () => {
        // Array of found elements with given selector has 4 elements in total
        cy.get('input[type="radio"]').should('have.length', 4)

        // Verify labels of the radio buttons
        cy.get('input[type="radio"]').next().eq(0).should('have.text','Daily')
        cy.get('input[type="radio"]').next().eq(1).should('have.text','Weekly')
        cy.get('input[type="radio"]').next().eq(2).should('have.text','Monthly')
        cy.get('input[type="radio"]').next().eq(3).should('have.text','Never')
    })

    it('Check that dopdown list is correct', () => {
        // Array of found elements with given selector has 4 elements in total
        cy.get('#country').find('option').should('have.length', 4)

        // Check that all elements in the dropdown have correct text
        cy.get('#country').find('option').eq(0).should('have.text', '')
        cy.get('#country').find('option').eq(1).should('have.text', 'Spain')
        cy.get('#country').find('option').eq(2).should('have.text', 'Estonia')
        cy.get('#country').find('option').eq(3).should('have.text', 'Austria')
    })

    it('Check that list of cities changes depending on the choice of country', () => {
        // Choose country and check the list of cities
        cy.get('select#country').select('Spain')

        // Array of found elements with given selector has 5 elements in total
        cy.get('#city').find('option').should('have.length', 5)

        // Check that all elements in cities list have correct text
        cy.get('#city').find('option').eq(0).should('have.text', '')
        cy.get('#city').find('option').eq(1).should('have.text', 'Malaga')
        cy.get('#city').find('option').eq(2).should('have.text', 'Madrid')
        cy.get('#city').find('option').eq(3).should('have.text', 'Valencia')
        cy.get('#city').find('option').eq(4).should('have.text', 'Corralejo')

        // Change country
        cy.get('select#country').select('Estonia')

        // Array of found elements with given selector has 4 elements in total
        cy.get('#city').find('option').should('have.length', 4)

        // Check that the list of cities is not the same
        cy.get('#city').find('option').eq(1).should('not.have.text', 'Malaga')
        cy.get('#city').find('option').eq(2).should('not.have.text', 'Madrid')
        cy.get('#city').find('option').eq(3).should('not.have.text', 'Valencia')
    })

    it('Check that if city is already chosen and country is updated, then city choice should be removed', () => {
        // Choose a country
        cy.get('select#country').select('Spain')

        // Choose a city and check that it is selected
        cy.get('select#city').select('Malaga')
        cy.get('#city').find('option').eq(1).should('be.selected')

        // Choose a different counrty
        cy.get('select#country').select('Estonia')

        // Check that no city is selected
        cy.get('#city').find('option').eq(0).should('not.be.selected')
        cy.get('#city').find('option').eq(1).should('not.be.selected')
        cy.get('#city').find('option').eq(2).should('not.be.selected')
        cy.get('#city').find('option').eq(3).should('not.be.selected')
    })
    
    it('Check that checkbox list is correct', () => {
        cy.get('input[type="checkbox"]').should('have.length', 2)
        cy.get('input[type="checkbox"]').parent().should('contain', 'Accept our privacy policy')
        cy.get('input[type="checkbox"]').parent().get('a[href]').should('contain', 'Accept our cookie policy')

        // Check "Accept our cookie policy" link
        cy.get(':nth-child(15) > button').children().eq(0).should('be.visible')
                .and('have.attr', 'href', 'cookiePolicy.html')
                .click()
        cy.url().should('contain', '/cookiePolicy.html')

        // Go back to previous page
        cy.go('back')
        cy.log('Back again in registration form 3')
    })

    it('Check that email needs to be in valid format', () => {
        // Input invalid email and check for error message
        cy.get('.email').type(invalidEmail)
        cy.get('h2').contains('Birthday').click()
        cy.get('[ng-show="myForm.email.$error.email"]').should('be.visible')

        // Clear field and check with valid email, no error message should be visible
        cy.get('.email').clear()
        cy.get('.email').type(validEmail)
        cy.get('h2').contains('Birthday').click()
        cy.get('[ng-show="myForm.email.$error.email"]').should('not.be.visible')
    })
})


// Variables
const invalidEmail = 'emailemail.com'
const validEmail = 'email@email.com'
const fullName = 'John Doe'


/*
BONUS TASK: add functional tests for registration form 3
Task list:
* Create second test suite for functional tests
* Create tests to verify logic of the page:
    * all fields are filled in + corresponding assertions
    * only mandatory fields are filled in + corresponding assertions
    * mandatory fields are absent + corresponding assertions (try using function)
    * add file functionlity(google yourself for solution!)
 */

describe('Functional tests for registration form 3', () => {

    it('Submit form with all fields filled', () => {
        // Check that it is possible to submit form with all fields filled
        cy.get('#name').type(fullName)
        cy.get('.email').type(validEmail)
        cy.get('select#country').select('Spain')
        cy.get('select#city').select('Malaga')
        cy.get(':nth-child(8) > input').type('2024-04-20')
        cy.get('[value="Never"]').check()
        cy.get('#birthday').type('2000-07-15')
        cy.get('.ng-pristine').check()
        cy.get(':nth-child(15) > :nth-child(2)').check()
        cy.get('h2').contains('Birthday').click()

        // Assert that submit button is enabled
        cy.get(':nth-child(2) > input').should('be.enabled')

        // Click submit and check that success page opens
        cy.get(':nth-child(2) > input').click()
        cy.url().should('contain', '/upload_file.html')
        cy.get('h1').should('contain', 'Submission received')
    })

    it('Submit form with only mandatory fields filled', () => {
        cy.get('.email').type(validEmail)
        cy.get('select#country').select('Spain')
        cy.get('select#city').select('Malaga')
        cy.get('.ng-pristine').check()

        // Assert that submit button is enabled
        cy.get(':nth-child(2) > input').should('be.enabled')

        // Click submit and check that success page opens
        cy.get(':nth-child(2) > input').click()
        cy.url().should('contain', '/upload_file.html')
        cy.get('h1').should('contain', 'Submission received')
    })

    it('Try to submit form with mandatory fields empty', () => {
        inputValidData('John Doe')

        // Clear mandatory fields
        cy.get('.email').scrollIntoView()
        cy.get('.email').clear()
        cy.get('select#country').select('')
        cy.get(':nth-child(15) > .ng-dirty').uncheck()
        cy.get('h2').contains('Birthday').click()

        // Assert that submit button is disabled
        cy.get(':nth-child(2) > input').should('be.disabled')
    })

    it('Upload a file and submit it', () => {
        cy.upload_file('checkbox1_error.png', 'image/png', 'input[type="file"]')
        cy.get('.w3-container > button').click()

        // Check that submission page opens
        cy.url().should('contain', '/upload_file.html')
        cy.get('h1').should('contain', 'Submission received')
    })
})

function inputValidData(name) {
    cy.log('Name will be filled')
    cy.get('#name').type(name)
        cy.get('.email').type(validEmail)
        cy.get('select#country').select('Spain')
        cy.get('select#city').select('Malaga')
        cy.get(':nth-child(8) > input').type('2024-04-20')
        cy.get('[value="Never"]').check()
        cy.get('#birthday').type('2000-07-15')
        cy.get('.ng-pristine').check()
        cy.get(':nth-child(15) > :nth-child(2)').check()
        cy.get('h2').contains('Birthday').click()
}