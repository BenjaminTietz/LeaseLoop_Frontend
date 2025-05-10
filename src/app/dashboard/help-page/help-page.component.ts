import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  signal,
  effect,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContactFormComponent } from "./contact-form/contact-form.component";

@Component({
  selector: 'app-help-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ContactFormComponent],
  templateUrl: './help-page.component.html',
  styleUrl: './help-page.component.scss',
})
export class HelpPageComponent {
  @ViewChildren('topicRef') topicRefs!: QueryList<ElementRef>;
  contactFormOpen = signal(false);
  searchTerm = signal('');

  sections = signal([
    {
      title: 'System Setup and Workflow',
      open: false,
      topics: [
        {
          title: 'Step 1: Create a Property',
          content: `
            To start using the system, first create a Property. 
            Then add at least one Unit (e.g., room, apartment) associated with this Property. 
            Without a Unit, you cannot create bookings.
          `,
          gif: 'help-page/property.gif',
        },
        {
          title: 'Step 2: Add Unit and assign to property',
          content: `
            After creating a Property, you can add Units (e.g., rooms, apartments) to it. 
            Each Unit can have its own set of features and pricing.
          `,
          gif: 'help-page/unit.gif',
        },
        {
          title: 'Step 3: Add Clients (Guests)',
          content: `
            Before creating a booking, you must add a Client (Guest) to the system. 
            Alternatively, you can select an existing Client when creating a new booking.
          `,
          gif: 'help-page/client.gif',
        },
        {
          title: 'Step 4: Create a Booking',
          content: `
            A Booking connects a Client to a Unit for a specified date range. 
            During the booking process, you can also add optional Services to enhance the guest's stay.
          `,
          gif: 'help-page/booking.gif',
        },
        {
          title: 'Step 4: Add Optional Services',
          content: `
            Services can be booked per stay (one-time charge) or per day (e.g., Breakfast). 
            Services are automatically included in the invoice.
          `,
          gif: 'help-page/service.gif',
        },
        {
          title: 'Step 5: Manage Promo Codes',
          content: `
            You can create Promo Codes to offer discounts. 
            Each Promo Code has an optional expiration date and defines a discount percentage.
          `,
          gif: 'help-page/promo.gif',
        },
        {
          title: 'Step 6: Automatic Invoice Generation',
          content: `
            Once a booking is created, an invoice is automatically generated based on the booking details. 
            When the booking is updated, a new updated invoice is automatically created.
          `,
          gif: 'helppage/property.gif', // TODO:  Replace Placeholder for invoice gif
        },
        {
          title: 'Step 7: Track Analytics',
          content: `
            In the Analytics section, you can view key metrics such as total revenue, occupancy rates, 
            booking trends, and cancellation rates, presented in clear and interactive charts.
          `,
          gif: 'help-page/analytics.gif',
        },
      ],
    },

    {
      title: 'Managing Properties',
      open: false,
      topics: [
        {
          title: 'Creating Your First Property',
          content:
            'Go to the "Properties" section, click "Add Property", and fill in the basic information.',
          gif: 'helppage/property.gif',
        },
        {
          title: 'Adding Units to a Property',
          content:
            'After creating a property, click "Add Unit" and set up room details.',
          gif: 'help-page/property.gif',
        },
      ],
    },
    {
      title: 'Managing Bookings',
      open: false,
      topics: [
        {
          title: 'Creating a Booking',
          content:
            'Navigate to "Bookings" and click "New Booking". Choose a Client, Unit, and date range.',
          gif: 'help-page/booking.gif',
        },
      ],
    },
    {
      title: 'Managing Clients',
      open: false,
      topics: [
        {
          title: 'Adding a New Client',
          content:
            'Go to the "Clients" section, click "Add Client", and fill in the required details.',
          gif: 'help-page/client.gif',
        },
        {
          title: 'Editing Client Information',
          content:
            'Select a client from the list, click "Edit", and update the necessary information.',
        },
      ],
    },
    {
      title: 'Services and Promo Codes',
      open: false,
      topics: [
        {
          title: 'Adding Extra Services',
          content:
            'Services can be linked to Bookings to offer additional guest benefits. Service can be charged once or per day.',
          gif: 'help-page/promo.gif',
        },
      ],
    },
  ]);

  searchResults = computed(() => {
    const search = this.searchTerm().toLowerCase();
    if (!search) {
      return [];
    }

    const results: { topicTitle: string; sectionTitle: string }[] = [];

    this.sections().forEach((section) => {
      section.topics.forEach((topic) => {
        if (
          topic.title.toLowerCase().includes(search) ||
          topic.content.toLowerCase().includes(search)
        ) {
          results.push({
            topicTitle: topic.title,
            sectionTitle: section.title,
          });
        }
      });
    });

    return results;
  });

  filteredSections = computed(() => {
    const search = this.searchTerm().toLowerCase();
    if (!search) {
      return this.sections();
    }

    return this.sections()
      .map((section) => ({
        ...section,
        topics: section.topics.filter(
          (topic) =>
            topic.title.toLowerCase().includes(search) ||
            topic.content.toLowerCase().includes(search)
        ),
      }))
      .filter((section) => section.topics.length > 0);
  });

  constructor() {
    effect(() => {
      const term = this.searchTerm().trim();
      if (term.length > 0) {
        const closed = this.sections().map((section) => ({
          ...section,
          open: false,
        }));
        this.sections.set(closed);
      }
    });
  }

  toggleSection(index: number) {
    const selectedTitle = this.filteredSections()[index].title;

    const updated = this.sections().map((section) => {
      if (section.title === selectedTitle) {
        return { ...section, open: !section.open };
      } else {
        return { ...section, open: false };
      }
    });

    this.sections.set(updated);
  }

  openSectionFromSearch(sectionTitle: string, topicTitle: string) {
    const updated = this.sections().map((section) => ({
      ...section,
      open: section.title === sectionTitle,
    }));
    this.sections.set(updated);

    setTimeout(() => {
      const matchingTopic = this.topicRefs.find((ref) => {
        return (
          ref.nativeElement.getAttribute('data-topic-title') === topicTitle
        );
      });

      matchingTopic?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      this.searchTerm.set('');
    }, 150);
  }

  openContactForm(){
    this.contactFormOpen.set(true);
  }

  closeForm(){
    this.contactFormOpen.set(false);
  }
}
