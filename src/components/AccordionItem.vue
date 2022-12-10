<template>
    <div class="accordion-item">
        <h2 class="accordion-header text-bg-dark" :id="('heading' + id)">
            <button class="accordion-button" type="button" data-bs-toggle="collapse" :data-bs-target="'#collapse' + id"
                aria-expanded="true" :aria-controls="('collapse' + id)">
                {{ header }}
            </button>
        </h2>
        <div :id="('collapse' + id)" :class="['accordion-collapse collapse', show ? 'show' : '']"
            :aria-labelledby="('heading' + id)" data-bs-parent="#accordionExample">
            <div class="accordion-body">
                <slot />
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
    name: "AccordionItem",
    props: ['id', 'show', 'header']
})
</script>