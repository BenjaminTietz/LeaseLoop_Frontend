import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { AnalyticsService } from '../../../../services/analytics-service/analytics.service';
import { ClickOutsideDirective } from '../../../../directives/outside-click/click-outside.directive';
import { MatTooltipModule } from '@angular/material/tooltip';

interface UnitData {
  name?: string;
  confirmed?: number;
  total?: number;
}

interface PropertyData {
  name?: string;
  units: Record<string, UnitData>;
}

@Component({
  selector: 'app-booking-chart',
  standalone: true,
  imports: [
    CommonModule,
    NgApexchartsModule,
    ClickOutsideDirective,
    MatTooltipModule,
  ],
  templateUrl: './booking-chart.component.html',
  styleUrl: './booking-chart.component.scss',
})
export class BookingChartComponent {
  analyticsService = inject(AnalyticsService);
  rawData = computed(() => this.analyticsService.bookingData() as any);
  data = computed(() => {
    const raw = this.rawData();
    return (raw?.properties as Record<string, PropertyData>) ?? {};
  });

  clickOutside = () => this.selectedLabel.set(null);
  selectedLabel = signal<string | null>(null);
  ngOnInit(): void {
    const from = this.analyticsService.dateFrom();
    const to = this.analyticsService.dateTo();
    const property = this.analyticsService.selectedProperty();
    const unit = this.analyticsService.selectedUnit();
    this.analyticsService.getBookingData(from, to);
  }

  generateSpectrumColors(count: number): string[] {
    const colors: string[] = [];
    const saturation = 70;
    const lightness = 50;

    for (let i = 0; i < count; i++) {
      const hue = Math.round((360 / count) * i);
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return colors;
  }

  colors = computed(() => {
    const data = this.chartData();
    return this.generateSpectrumColors(data.length);
  });

  total = computed(() => {
    const properties = this.data();
    let total = 0;

    for (const prop of Object.values(properties)) {
      for (const unit of Object.values(prop.units)) {
        total += unit.confirmed ?? unit.total ?? 0;
      }
    }

    return total;
  });

  chartData = computed(() => {
    const properties = this.data();
    const result: { label: string; value: number }[] = [];

    for (const propId in properties) {
      const prop = properties[propId];
      const propName = prop.name ?? `Property ${propId}`;
      for (const unitId in prop.units) {
        const unit = prop.units[unitId];
        const unitName = unit.name ?? `Unit ${unitId}`;
        const value = unit.confirmed ?? unit.total ?? 0;
        result.push({ label: `${propName} - ${unitName}`, value });
      }
    }

    return result;
  });

  slices = computed(() => {
    const total = this.total();
    const data = [...this.chartData()].sort((a, b) => a.value - b.value);
    let startAngle = 0;

    return data.map((item, index) => {
      const value = item.value;
      const angle = (value / total) * 360;
      const endAngle = startAngle + angle;

      const centerX = 120;
      const centerY = 120;
      const radius = 100;

      const largeArc = angle > 180 ? 1 : 0;

      const x1 = centerX + radius * Math.cos((Math.PI * startAngle) / 180);
      const y1 = centerY + radius * Math.sin((Math.PI * startAngle) / 180);
      const x2 = centerX + radius * Math.cos((Math.PI * endAngle) / 180);
      const y2 = centerY + radius * Math.sin((Math.PI * endAngle) / 180);

      const d = `M${centerX},${centerY} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;

      const midAngle = startAngle + angle / 2;
      const labelRadius = 85;
      const textX =
        centerX + labelRadius * Math.cos((Math.PI * midAngle) / 180);
      const textY =
        centerY + labelRadius * Math.sin((Math.PI * midAngle) / 180);

      const percent = ((value / total) * 100).toFixed(1);
      const percentValue = parseFloat(percent);
      const showText = percentValue >= 3;

      startAngle = endAngle;

      return {
        d,
        color: this.colors()[index],
        label: item.label,
        value: item.value,
        percent,
        textPos: showText ? { x: textX, y: textY } : null,
      };
    });
  });

  hoveredSlice = signal<number | null>(null);

  tooltip = signal<{
    x: number;
    y: number;
    label: string;
    value: number;
  } | null>(null);

  onSliceEnter(index: number, event: MouseEvent, label: string, value: number) {
    this.hoveredSlice.set(index);
    this.tooltip.set({
      x: event.clientX,
      y: event.clientY,
      label,
      value,
    });
  }

  onSliceLeave() {
    this.hoveredSlice.set(null);
    this.tooltip.set(null);
  }
  selectSlice(label: string) {
    this.selectedLabel.set(this.selectedLabel() === label ? null : label);
  }
}
