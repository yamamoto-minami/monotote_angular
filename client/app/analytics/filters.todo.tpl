
      <!-- unit filter -->
      <div class="unit-filter">
        <select id="segmentation-unit" name="segmentation-unit">
        {% for unit in content["filter-units"] %}
          <option value="{{ unit.value | default(unit.name) }}" {% if unit.default %}selected {% endif %}>{{ unit.name|capitalize }}</option>
        {% endfor%}
        </select>
      </div>

      <!-- type filter -->
      <div class="type-filter">
      <select id="segmentation-type" name="segmentation-type">
        {% for type in content["filter-types"] %}
          <option value="{{ type.value | default(type.name) }}" {% if type.default %}selected {% endif %}>{{ type.name|capitalize }}</option>
        {% endfor%}
      </select>
      </div>
