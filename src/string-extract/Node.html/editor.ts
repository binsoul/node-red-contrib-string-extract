import type { EditorNodeProperties, EditorRED } from 'node-red';
import { MappedOutput } from '../MappedOutput';
import type { UserConfigurationOptions } from '../UserConfiguration';

declare const RED: EditorRED;

interface NodeEditorProperties extends EditorNodeProperties, UserConfigurationOptions {}

RED.nodes.registerType<NodeEditorProperties>('binsoul-string-extract', {
    category: 'function',
    color: '#A6BBCF',
    defaults: {
        extractionMode: {
            value: 'regexp',
            required: true,
        },
        extractionRegexpPattern: {
            value: '(.*)',
            required: false,
        },
        extractionRegexpFlags: {
            value: [],
            required: false,
        },
        extractionSplitSeparator: {
            value: '',
            required: false,
        },
        inputValueProperty: {
            value: 'payload',
            required: true,
        },
        inputValueSource: {
            value: 'msg',
            required: true,
        },
        outputMapping: {
            value: [],
            required: false,
        },
        name: { value: '' },
    },
    inputs: 1,
    outputs: 1,
    icon: 'font-awesome/fa-share-square-o',
    label: function () {
        const extractionMode = this._('binsoul-string-extract.option.extractionMode.' + this.extractionMode);
        return this.name || extractionMode;
    },
    labelStyle: function () {
        return this.name ? 'node_label_italic' : '';
    },
    paletteLabel: 'string extract',
    inputLabels: 'Incoming message',
    outputLabels: ['Outgoing message'],
    oneditprepare: function () {
        $('#node-input-inputValueProperty').typedInput({
            typeField: '#node-input-inputValueSource',
            types: ['msg', 'flow', 'global'],
            default: 'msg',
        });

        const showExtractionModeOptions = (mode: string) => {
            const regexpOptions = $('#extractionRegexp');
            const splitOptions = $('#extractionSplit');

            regexpOptions.hide();
            splitOptions.hide();

            if (mode === 'regexp') {
                regexpOptions.show();
            } else if (mode === 'split') {
                splitOptions.show();
            }
        };

        $('#node-input-extractionMode').on('change', (e: JQuery.TriggeredEvent) => {
            const option = e.currentTarget.value;
            showExtractionModeOptions(option);
        });

        showExtractionModeOptions(this.extractionMode || 'regexp');

        const container = $('#node-input-outputMapping-container');
        container.editableList<MappedOutput>({
            addItem: (container, i, outputValue) => {
                const wrapper = $('<div/>', { class: 'item' });
                wrapper.appendTo(container);

                const targetContainer = $('<div/>', { class: 'target' });
                targetContainer.appendTo(wrapper);
                const targetInput = $('<input/>', { class: 'binsoul-string-extract-input node-input-outputMapping-target', type: 'text' });
                targetInput.prependTo(targetContainer);

                targetInput.typedInput({
                    types: ['msg', 'flow', 'global'],
                    default: 'msg',
                });

                const equalsContainer = $('<div/>', { class: 'equals' });
                equalsContainer.appendTo(wrapper);
                $('<span>=</span>').appendTo(equalsContainer);

                const transformContainer = $('<div/>', { class: 'value' });
                transformContainer.appendTo(wrapper);

                const valueInput = $('<input/>', { class: 'binsoul-string-extract-input node-input-outputMapping-value', type: 'text' });
                valueInput.appendTo(transformContainer);

                valueInput.typedInput({
                    types: [
                        { value: 'matches', label: this._('binsoul-string-extract.option.outputMapping-value.matches'), icon: 'fa fa-list', hasValue: false },
                        { value: 'match', label: this._('binsoul-string-extract.option.outputMapping-value.match'), icon: 'fa fa-hashtag', hasValue: true, validate: RED.validators.number() },
                        'str',
                        'num',
                        'bool',
                        'json',
                        'bin',
                        'date',
                        'jsonata',
                    ],
                    default: 'match',
                });

                if (outputValue) {
                    targetInput.typedInput('type', outputValue.outputTarget);
                    targetInput.typedInput('value', outputValue.outputProperty);
                    valueInput.typedInput('type', outputValue.valueSource);
                    valueInput.typedInput('value', outputValue.valueProperty);
                } else {
                    targetInput.typedInput('value', 'value' + (this.outputMapping.length + 1));
                    valueInput.typedInput('value', '' + (this.outputMapping.length + 1));
                }
            },
            header: (() => {
                const wrapper = $('<div/>', { class: 'binsoul-string-extract-editable-list-header' });

                const sortColumn = $('<div/>');
                sortColumn.appendTo(wrapper);

                const targetColumn = $('<div class="target"/>').append(this._('binsoul-string-extract.label.outputMapping-target'));
                targetColumn.appendTo(wrapper);

                const equalsColumn = $('<div class="equals" />').append('<span>&nbsp;</span>');
                equalsColumn.appendTo(wrapper);

                const valueColumn = $('<div/ class="value">').append(this._('binsoul-string-extract.label.outputMapping-value'));
                valueColumn.appendTo(wrapper);

                return wrapper;
            })(),
            removable: true,
            sortable: true,
        });

        if (this.outputMapping) {
            this.outputMapping.forEach(function (m) {
                container.editableList('addItem', m);
            });
        }
    },
    oneditsave: function () {
        const container = $('#node-input-outputMapping-container');
        const outputValueItems = container.editableList('items');
        const outputMapping: Array<MappedOutput> = [];
        outputValueItems.each(function () {
            const output: MappedOutput = {
                outputTarget: $(this).find('.node-input-outputMapping-target').typedInput('type'),
                outputProperty: $(this).find('.node-input-outputMapping-target').typedInput('value'),
                valueSource: $(this).find('.node-input-outputMapping-value').typedInput('type'),
                valueProperty: $(this).find('.node-input-outputMapping-value').typedInput('value'),
            };

            if (output.outputProperty == '' || (output.valueSource !== 'matches' && output.valueProperty == '')) {
                return;
            }

            outputMapping.push(output);
        });

        this.outputMapping = outputMapping;
    },
});
