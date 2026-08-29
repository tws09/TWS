import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MarketingLayout, PrimaryActions, Reveal } from '../components/MarketingShell';
import PlatformWorkspacePicture from '../components/PlatformWorkspacePicture';

const productAreas = [
  ['Projects & Delivery', 'Keep delivery moving.', 'Plan projects, tasks, sprints and timelines without separating delivery from the business.', '/product/projects', 'delivery'],
  ['People & HR', 'Run the team behind the work.', 'Manage employees, attendance, leave and company structure where teams deliver projects.', '/product/people', 'people'],
  ['Finance', 'Connect the work to the numbers.', 'Keep billing, expenses, budgets and payroll closer to the work generating them.', '/product/finance', 'finance'],
  ['Clients & Growth', 'Keep clients connected to delivery.', 'Organize client information, partners and project relationships in one operating system.', '/product/clients', 'clients'],
  ['Documents & Sheets', 'Keep knowledge where work happens.', 'Create documents, spreadsheets and forms inside the company workspace.', '/product/documents', 'knowledge'],
];

const roles = [
  ['Owners & Operations', 'See projects, teams, clients, finances and operations without assembling reports from disconnected systems.'],
  ['Project Managers', 'Plan projects, coordinate teams, organize work and keep delivery structured.'],
  ['HR Teams', 'Manage employees, attendance, leave, teams and workforce operations.'],
  ['Finance Teams', 'Keep billing, expenses, budgets and payroll closer to operational context.'],
  ['Employees', 'Use one workspace for projects, tasks, documents, attendance and everyday work.'],
];

const comparisonRows = [
  ['Project delivery', 'Separate project tool', 'Delivery connected to people, clients and finance'],
  ['People operations', 'HR records without project context', 'Employee operations beside the work'],
  ['Client context', 'Scattered across inboxes and documents', 'Clients connected to active delivery'],
  ['Finance', 'Invoices and expenses tracked elsewhere', 'Financial workflows closer to operations'],
  ['Company knowledge', 'Files spread across drives and apps', 'Documents, sheets and forms in the workspace'],
];

const workflow = [
  ['01', 'Client', 'Start with the relationship and its operating context.'],
  ['02', 'Project', 'Shape the engagement, milestones and delivery plan.'],
  ['03', 'Team', 'Connect the people responsible for the outcome.'],
  ['04', 'Work', 'Coordinate tasks, sprints, time and documents.'],
  ['05', 'Delivery', 'Keep progress and client context visible.'],
  ['06', 'Billing', 'Bring financial workflows closer to delivered work.'],
];

const solutions = [
  ['Software houses', 'Connect the company behind every software project.', '/solutions/software-houses'],
  ['Digital agencies', 'Run client delivery and agency operations from one base.', '/solutions/digital-agencies'],
  ['IT service companies', 'Coordinate service delivery, people and business operations.', '/solutions/it-service-companies'],
];

const compatibility = [
  ['XLSX import and export', 'Move spreadsheet work in and out without rebuilding it by hand.'],
  ['Documents and files', 'Keep operational knowledge and cloud-hosted files near the work.'],
  ['Forms and templates', 'Standardize recurring intake and internal processes.'],
  ['Client-facing workflows', 'Give client activity a focused path into the same operating context.'],
];

const MarketingHome = () => {
  const [role, setRole] = useState(0);
  return (
    <MarketingLayout>
      <section className="mk-hero">
        <div className="mk-shell mk-hero-grid">
          <Reveal className="mk-hero-copy">
            <p className="mk-eyebrow">The operating platform for software houses</p>
            <h1>Run your software house from one base.</h1>
            <p className="mk-hero-lede">Manage projects, people, clients, finance and operations in one connected platform built for software companies.</p>
            <PrimaryActions />
          </Reveal>
          <Reveal className="mk-product-frame">
            <PlatformWorkspacePicture priority />
          </Reveal>
        </div>
      </section>

      <section className="mk-problem mk-section">
        <div className="mk-shell mk-problem-layout">
          <Reveal>
            <h2>Your company shouldn't need ten tools to run one business.</h2>
            <p>Delivery, attendance, payroll, clients and documents drift into separate systems. Leadership then spends hours rebuilding the whole picture.</p>
          </Reveal>
          <Reveal className="mk-converge" aria-label="Disconnected operations converge into HousesBase">
            <div>{['Project delivery', 'People operations', 'Client context', 'Finance', 'Company knowledge'].map((item) => <span key={item}>{item}</span>)}</div>
            <div className="mk-converge-line" aria-hidden="true" />
            <strong><i><span>H</span></i>HousesBase<small>One connected workspace</small></strong>
          </Reveal>
        </div>
      </section>

      <section className="mk-section mk-comparison">
        <div className="mk-shell">
          <Reveal className="mk-section-intro">
            <p className="mk-eyebrow">The operational difference</p>
            <h2>Replace a stack of disconnected tools with shared context.</h2>
            <p>HousesBase does not simply put more features in one menu. It connects the records and workflows that describe how your company operates.</p>
          </Reveal>
          <div className="mk-comparison-table" role="table" aria-label="Traditional software stack compared with HousesBase">
            <div className="mk-comparison-head" role="row">
              <span role="columnheader">Operational area</span>
              <span role="columnheader">Traditional stack</span>
              <span role="columnheader">HousesBase</span>
            </div>
            {comparisonRows.map(([area, traditional, housesBase]) => (
              <Reveal className="mk-comparison-row" key={area} as="div">
                <strong role="cell">{area}</strong>
                <span role="cell"><i aria-hidden="true">×</i>{traditional}</span>
                <span role="cell"><i aria-hidden="true">✓</i>{housesBase}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-section mk-platform" id="platform">
        <div className="mk-shell">
          <Reveal className="mk-section-intro">
            <p className="mk-eyebrow">One connected platform</p>
            <h2>Every part of your operation has a place.</h2>
            <p>From the first client conversation to delivery, employee operations and finance, your teams share one operational base.</p>
          </Reveal>
          <div className="mk-area-grid">
            {productAreas.map(([label, title, copy, href, tone], index) => (
              <Reveal as="article" key={label} className={`mk-area mk-area-${tone} ${index === 0 ? 'mk-area-featured' : ''}`}>
                <span>{label}</span><h3>{title}</h3><p>{copy}</p><Link to={href}>Explore {label} <b aria-hidden="true">→</b></Link>
                <div className="mk-area-visual" aria-hidden="true"><i /><i /><i /><i /></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-section mk-connected">
        <div className="mk-shell">
          <Reveal className="mk-connected-title"><h2>Your systems should know each other.</h2><p>HousesBase turns separate operational tools into one company system.</p></Reveal>
          <div className="mk-connection-map">
            {[
              ['Projects need people', 'Connect delivery with the employees and teams doing the work.'],
              ['Clients need projects', 'Keep client relationships close to delivery.'],
              ['People need context', 'Bring attendance, leave, payroll and structure together.'],
              ['Finance needs operations', 'Keep financial workflows close to the activity creating them.'],
            ].map(([title, copy]) => <Reveal key={title} className="mk-connection"><span>{title}</span><p>{copy}</p></Reveal>)}
            <div className="mk-map-core"><span>H</span><strong>One company system</strong></div>
          </div>
        </div>
      </section>

      <section className="mk-section mk-workflow">
        <div className="mk-shell">
          <Reveal className="mk-section-intro">
            <p className="mk-eyebrow">One software-house workflow</p>
            <h2>Follow the work from client request to business outcome.</h2>
            <p>Each stage adds context to the same operational story instead of creating another isolated record.</p>
          </Reveal>
          <ol className="mk-workflow-track">
            {workflow.map(([number, title, copy]) => (
              <Reveal as="li" key={title}><span>{number}</span><strong>{title}</strong><p>{copy}</p></Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="mk-section mk-solutions">
        <div className="mk-shell">
          <Reveal className="mk-section-intro"><p className="mk-eyebrow">Built around your operating model</p><h2>Choose the path that sounds like your company.</h2></Reveal>
          <div className="mk-solution-grid">
            {solutions.map(([title, copy, href], index) => (
              <Reveal as="article" key={title} className={index === 0 ? 'mk-solution-featured' : ''}>
                <span>{String(index + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{copy}</p><Link to={href}>Explore solution <b aria-hidden="true">→</b></Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-section mk-nucleus">
        <div className="mk-shell mk-nucleus-grid">
          <Reveal className="mk-nucleus-copy"><p className="mk-eyebrow">HousesBase Intelligence</p><h2>Meet Nucleus.</h2><h3>AI that understands project operations.</h3><p>Nucleus helps teams work with project context, organize tasks and support planning without leaving HousesBase.</p><Link className="mk-text-link" to="/product/nucleus">Discover Nucleus <span aria-hidden="true">→</span></Link></Reveal>
          <Reveal className="mk-nucleus-panel" aria-label="Example Nucleus project workflow">
            <div className="mk-nucleus-head"><span>Nucleus</span><small>Project assistance</small></div>
            <div className="mk-nucleus-prompt"><small>You</small><p>Create sprint tasks from the client portal requirements and group them by delivery stage.</p></div>
            <div className="mk-nucleus-response"><small>Nucleus</small><strong>Drafted 6 structured actions</strong><ul><li>Define portal access rules</li><li>Build invoice summary view</li><li>Add document-sharing permissions</li></ul><span>Review before adding to project <b aria-hidden="true">→</b></span></div>
          </Reveal>
        </div>
      </section>

      <section className="mk-section mk-roles">
        <div className="mk-shell"><Reveal className="mk-section-intro"><h2>One platform. Different views of the same business.</h2></Reveal>
          <div className="mk-role-selector">
            <div role="tablist" aria-label="Value by role">{roles.map(([label], index) => <button key={label} role="tab" aria-selected={role === index} onClick={() => setRole(index)}>{label}</button>)}</div>
            <div className="mk-role-content" role="tabpanel"><span>{roles[role][0]}</span><p>{roles[role][1]}</p><Link to="/product">See the connected platform <b aria-hidden="true">→</b></Link></div>
          </div>
        </div>
      </section>

      <section className="mk-section mk-workspace">
        <div className="mk-shell mk-workspace-grid">
          <Reveal><h2>Every company gets its own HousesBase.</h2><p>Each organization gets a dedicated workspace for its people, projects, clients and operations.</p></Reveal>
          <Reveal className="mk-address"><span>yourcompany</span><b>.housesbase.com</b><small>Your company workspace</small></Reveal>
        </div>
      </section>

      <section className="mk-section mk-compatibility">
        <div className="mk-shell mk-compatibility-layout">
          <Reveal><p className="mk-eyebrow">Workflow compatibility</p><h2>Bring existing work with you.</h2><p>Adoption should not require your company to abandon useful formats or rebuild every process on day one.</p><Link className="mk-text-link mk-text-link-dark" to="/product/documents">Explore work and knowledge <span aria-hidden="true">→</span></Link></Reveal>
          <div>{compatibility.map(([title, copy]) => <Reveal key={title}><span aria-hidden="true">↗</span><div><strong>{title}</strong><p>{copy}</p></div></Reveal>)}</div>
        </div>
      </section>

      <section className="mk-section mk-trust">
        <div className="mk-shell mk-trust-grid"><Reveal><p className="mk-eyebrow">Proof before promises</p><h2>Trust should come from product facts.</h2><p>Review the product surface, security approach and release history before making a decision. HousesBase does not present unsupported certification or customer claims.</p><div className="mk-trust-links"><Link to="/security">Security approach <span>→</span></Link><Link to="/changelog">Product changelog <span>→</span></Link></div></Reveal><div>{['Dedicated company workspaces', 'Role-aware access', 'Centralized operational modules', 'Audit-aware workflows', 'Cloud file storage', 'Company-wide notifications'].map((item) => <Reveal key={item}><span aria-hidden="true">✓</span>{item}</Reveal>)}</div></div>
      </section>

      <section className="mk-section mk-pricing-preview">
        <div className="mk-shell mk-pricing-preview-grid">
          <Reveal><p className="mk-eyebrow">Pricing without guesswork</p><h2>Start with the operation you need to connect.</h2><p>Pricing is being finalized. We will help map your workspace, modules and rollout path without publishing invented tiers or artificial feature gates.</p></Reveal>
          <Reveal className="mk-pricing-preview-card"><span>Workspace planning</span><h3>A setup shaped around your company.</h3><ul><li>Dedicated company workspace</li><li>Relevant operational modules</li><li>Role and access planning</li><li>Practical rollout conversation</li></ul><div><Link className="mk-button mk-button-primary" to="/pricing">Review pricing approach</Link><Link to="/contact">Book consultation <span aria-hidden="true">→</span></Link></div></Reveal>
        </div>
      </section>

      <section className="mk-final"><div className="mk-shell"><Reveal><h2>Bring your software house back to one base.</h2><p>Projects. People. Clients. Finance. Operations. Connected through HousesBase.</p><PrimaryActions secondary="Book a Demo" secondaryTo="/contact" /></Reveal></div></section>
    </MarketingLayout>
  );
};

export default MarketingHome;
