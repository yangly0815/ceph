import { HostsPageHelper } from '../cluster/hosts.po';

describe('Hosts page', () => {
  const hosts = new HostsPageHelper();

  beforeEach(() => {
    cy.login();
    hosts.navigateTo();
  });

  describe('when Orchestrator is available', () => {
    beforeEach(function () {
      cy.fixture('orchestrator/inventory.json').as('hosts');
    });

    it('should not add an exsiting host', function () {
      const hostname = Cypress._.sample(this.hosts).name;
      hosts.navigateTo('create');
      hosts.add(hostname, true);
    });

    it('should delete a host and add it back', function () {
      const host = Cypress._.last(this.hosts)['name'];
      hosts.delete(host);

      // add it back
      hosts.navigateTo('create');
      hosts.add(host);
      hosts.checkExist(host, true);
    });

    it('should display inventory', function () {
      for (const host of this.hosts) {
        hosts.clickHostTab(host.name, 'Inventory');
        cy.get('cd-host-details').within(() => {
          hosts.getTableCount('total').should('be.gte', 0);
        });
      }
    });

    it('should display daemons', function () {
      for (const host of this.hosts) {
        hosts.clickHostTab(host.name, 'Daemons');
        cy.get('cd-host-details').within(() => {
          hosts.getTableCount('total').should('be.gte', 0);
        });
      }
    });

    it('should edit host labels', function () {
      const hostname = Cypress._.sample(this.hosts).name;
      const labels = ['foo', 'bar'];
      hosts.editLabels(hostname, labels, true);
      hosts.editLabels(hostname, labels, false);
    });
  });
});
