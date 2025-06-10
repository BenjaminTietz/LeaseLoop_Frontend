import { Component, inject, OnInit } from '@angular/core';
import { PropertiesService } from '../../../../services/properties-service/properties.service';
import { UnitsService } from '../../../../services/units-service/units.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../../../services/analytics-service/analytics.service';

@Component({
  selector: 'app-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './selector.component.html',
  styleUrl: './selector.component.scss',
})
export class SelectorComponent {
  propertyService = inject(PropertiesService);
  analyticsService = inject(AnalyticsService);
  UnitService = inject(UnitsService);
  constructor() {}
}
