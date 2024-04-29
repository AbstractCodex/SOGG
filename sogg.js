// Subject-Object Graph Generator
// Author: Daniel Burke

// Globals for the graph
var entities = {};
var array_types = [];                   // index to name
var map_type_name_to_index = {};        // name to index
var map_type_names_to_subj_names = {};
var array_type_indexes_to_subj_indexes = [];
var array_subj = [];                    // index to name
var map_subj_name_to_index = {};        // name to index

// Special Type definitions 
// More can be added. These are specified like this:
// Lantir ; type:character 
// Inn ; type:location
// These can be used for presenting the data differently
// Also, the center list of connections wil be ordered by type, name

const STARTING_INPUT_TEXT = `// Save your text separately and paste it here.  This app does not save your input!
# Characters

## Adramar
sex: m
is a : warhorse
is the steed of : Untherdred
was introduced in : C29_S01 Unth — Save the King

## Alana
sex: f
Secretly works for the Arcane Order, anxious, has a Lavender fin
img: D:/docs/tereya/images/reference/alana.jpg
is attracted to : Lantir
extends jokes of : Lantir
is half : Delk, Hunir
visited : Flatulent Slug

## Untherdred
sex:m
King of : Kingdom of Yondle
is a : Hunir
wields : Dawnbreaker


# Locations

## Flatulent Slug
Trading post
is in : Ikthi


# Races

## Hunir
Just like Humans except they can be wizards, and have a minor skin marking

## Delk
Have dragonscale hair, gold or green skin tone and almond eyes. Their whole body glows when excited and have rush of adrenaline.
`;


// Methods
function clicked_subj(_i_subj) {
    $("#other_info_about").html(gen_focused_subj_info(_i_subj));
    $("#cell_ref_obj").html(gen_ref_obj_table(_i_subj));
    $("#cell_ref_subj").html(gen_ref_subj_table(_i_subj));
}

function clicked_type(_i_type) {
    let type_subjs_id = "#type_subjs_" + _i_type;
    $(type_subjs_id).toggle();
}


/**
 * Gen Subject List (Index List on the far left)
 * Should we automatically open teh section that has the selected item? No. Could have multiple cats
 * We need to open the section when clicked. To do that, we must maintain an open/closed state for each type
 * Or, we just avoid regenerating teh subj list unless gen is clicked.
 * @param {number} _i_subj The Index of which subject is selected.
 * @returns 
 */
function gen_subj_list(_i_subj) {
    let out = "";

    for (let i=0; i<array_types.length; i++) {
        
        // First the type
        let type_id = "type_" + i;
        let type_subjs_id = "type_subjs_" + i;

        out += "<div id='" + type_id + "' class='style_type' onclick='clicked_type(" + i + ");'>";
        out +=      array_types[i];
        out += "</div>";        
        
        out += "<div id='" + type_subjs_id + "' class='style_type_subjs'>";
        let subj_indexes = array_type_indexes_to_subj_indexes[i];
        for (let j=0; j<subj_indexes.length; j++) {
            out += "<div class='style_subj' onclick='clicked_subj(" + subj_indexes[j] + ");'>";
            out +=      array_subj[subj_indexes[j]];
            out += "</div>";   
        }
        out += "</div>";        
    }
    return out;
}

function gen_focused_subj_info(_i_subj) {
    // If the index is out of bounds, this is just an initial table, with nothing selected, so we are done.
    if (_i_subj<0 || _i_subj>=array_subj.length) {
        return "";
    }
    subj = array_subj[_i_subj];
    let entity = entities[subj];

    let out = "<div class='style_subj_header'>" + subj + "</div> \n";
    if (has_member(entity, "img")) {
        out += "<div class='style_focus_img'><img src='" + entity.img + "' alt='Image unavailable' width='400' /></div> \n";
    }
    if (has_member(entity, "descript")) {
        out += "<div class='style_focus_description'>" + entity.descript + "</div> \n";
    }
    if (has_member(entity, "prompt_img_1")) {
        out += "<div>Prompt for AI Image generation:</div> \n";
        out += "<div class='style_focus_prompt_img'>" + entity.prompt_img_1 + "</div> \n";
    }
    if (has_member(entity, "prompt_img_2")) {
        out += "<div>Alternate prompt for AI Image generation:</div> \n";
        out += "<div class='style_focus_prompt_img'>" + entity.prompt_img_2 + "</div> \n";
    }
    if (has_member(entity, "prompt_img_3")) {
        out += "<div>Other alternate prompt for AI Image generation:</div> \n";
        out += "<div class='style_focus_prompt_img'>" + entity.prompt_img_3 + "</div> \n";
    }
    return out;
}

function printable_obj_str(conx, obj_name) {
    switch(conx.toLowerCase()) {
        case "sex":
            if (obj_name == "f")
                return "female";
            else if (obj_name == "m")
                return "male";
            return obj_name;
        
        default:
            return obj_name;
    }
}

function gen_ref_obj_table(_i_subj) {
    // If the index is out of bounds, this is just an initial table, with nothing selected, so we are done.
    if (_i_subj<0 || _i_subj>=array_subj.length) {
        return "";
    }
    subj = array_subj[_i_subj];
    let entity = entities[subj];

    let out = "";
    out += "<table class='style_table_sub_item'>";

    if (entity.hasOwnProperty("sex")) {
        let val = entity.sex;
        if (val == "f")
            val = "female";
        else if (val == "m")
            val = "male";            
        out += "<tr>";    
        out +=      "<td class='style_cell_sub_item_conx'>sex</td>";
        out +=      "<td class='style_cell_sub_name'><span class='style_nonclickable_ref'>" + val + "</span></td>";
        out += "</tr>";
    }

    for (let conx in entity.reln) {
        let num_obj = entity.reln[conx].length;
        out += "<tr>";    
        out +=      "<td class='style_cell_sub_item_conx'>"
        out +=          conx;
        out +=      "</td>";
        out +=      "<td class='style_cell_sub_name'>"
        for (let i=0; i<num_obj; i++) {
            let obj_name = entity.reln[conx][i]
            if (i>0)
                out += " , ";
            if (map_subj_name_to_index.hasOwnProperty(obj_name)) {
                // The obj is a subj
                out +=  "<span class='style_clickable_ref' onclick='clicked_subj(" + map_subj_name_to_index[obj_name] + ");' >";
            } else {
                out +=  "<span class='style_nonclickable_ref'>";
            }
            out +=          obj_name;
            out +=      "</span>";
        }
        out +=      "</td>";
        out += "</tr>";
    }
    out += "</table>";
    return out;
}


function gen_ref_subj_table(_i_subj) {
    // If the index is out of bounds, this is just an initial table, with nothing selected, so we are done.
    if (_i_subj<0 || _i_subj>=array_subj.length) {
        return "";
    }
    subj = array_subj[_i_subj];
    let entity = entities[subj];

    let out = "";
    out += "<table class='style_table_sub_item'>";
    for (let conx in entity.rev_reln) {
        let num_subj = entity.rev_reln[conx].length;
        out += "<tr>";
        out +=      "<td class='style_cell_sub_name'>";
        for (let i=0; i<num_subj; i++) {
            let subj_name = entity.rev_reln[conx][i]
            if (i>0)
                out += " , ";
            if (map_subj_name_to_index.hasOwnProperty(subj_name)) {
                // The subj is actualy a subj. Should always be teh case, but just in case.
                out +=  "<span class='style_clickable_ref' onclick='clicked_subj(" + map_subj_name_to_index[subj_name] + ");' >";
            } else {
                out +=  "<span class='style_nonclickable_ref'>";
            }
            out +=          subj_name;
            out +=      "</span>";
        }
        out +=      "</td>";
        out +=      "<td class='style_cell_sub_item_conx'>"
        out +=          conx;
        out +=      "</td>";
        out += "</tr>";
    }
    out += "</table>";
    return out;
}


function genDataToHtml() {
    $("#other_info_about").html("");
    $("#cell_ref_obj").html("");
    $("#cell_ref_subj").html("");    
    $("#cell_subj").html(gen_subj_list(-1));
}


function reset_state() {
    entities = {};
    array_types = [];
    map_type_name_to_index = {};
    map_type_names_to_subj_names = {};
    array_type_indexes_to_subj_indexes = [];
    array_subj = [];
    map_subj_name_to_index = {};
}


function process_entities() { 
    array_types = [];
    array_subj = [];
    map_type_names_to_subj_names = {};    
    // Add rev_reln empty memebers if they don't exist (they prob won't yet)
    // Also do the types list, and create the types => subj map
    let i_subj = 0;
    for (let [ent_name, entity] of Object.entries(entities)) {
        let type_name = entity.type.trim();
        array_types.push(type_name);
        create_or_append_array_in_map_with_simple(map_type_names_to_subj_names, type_name, entity.name);
        array_subj[i_subj] = entity.name;
        if (!entity.hasOwnProperty("rev_reln")) {
            entity.rev_reln = {};
        }

        // Normalize special attributes
        if (!entity.hasOwnProperty("sex")) {
            let sex = null;
            if (entity.hasOwnProperty("Sex")) {
                sex = entity.Sex;
                delete entity.Sex;
            } else if (entity.hasOwnProperty("SEX")) {
                sex = entity.SEX;
                delete entity.SEX;
            }
            if (sex) {
                entity.sex = sex;
            }
        }

        i_subj++;
    }
    array_types = [...new Set(array_types)];
    array_types.sort();

    // Fill in the reverse reln
    for (let [subj_name, subj_entity] of Object.entries(entities)) {

        for (let [conx, objects] of Object.entries(subj_entity.reln)) {
            for (let i=0; i< objects.length; i++) {
                let obj = objects[i];
                // obj is each Object of the reln, conx is the reln connector
                // We only do teh rev reln mapping if teh obj is a subj entity
                if (entities.hasOwnProperty(obj)) {
                    obj_entity = entities[obj];
                    create_or_append_array_in_map_with_simple(obj_entity.rev_reln, conx.toLowerCase(), subj_entity.name);
                }
            }            
        }
    }

    // Create array map lookups. These are needed because we can't use the raw sub/obj nmaes in html ids because of spaces, etc
    map_type_name_to_index = {};
    for (let i=0; i<array_types.length; i++) {
        map_type_name_to_index[array_types[i]] = i;
    }
    map_subj_name_to_index = {};
    for (let i=0; i<array_subj.length; i++) {
        map_subj_name_to_index[array_subj[i]] = i;
    }

    array_type_indexes_to_subj_indexes = [];
    for (let i=0; i<array_types.length; i++) {
        let subj_list = map_type_names_to_subj_names[array_types[i]];
        let subj_indexes = [];
        for (let j=0; j<subj_list.length; j++) {
            subj_indexes.push(map_subj_name_to_index[subj_list[j]]);
        }
        array_type_indexes_to_subj_indexes[i] = subj_indexes;
    }
}

function read_input_into_entities_json() {
    let input_text = $('#input_text').val();
    input_text = input_text.trim();

    // Detect format of input
    let format = "md";
    let lines = input_text.split("\n");
    for (const line of lines) {
        if (line.trim().startsWith('{') || line.trim().startsWith('[')) {
            format="json";
            break;
        }
    }
    if (format == "md") {
        // For markdown format, we first convert to JSON, then we use the same JSON parse function
        let lines2 = [];
        for (let line of lines) {    
            trimmed_line = line.trim();
            if (trimmed_line && trimmed_line.length>0 && !trimmed_line.startsWith("//")) {
                lines2.push(trimmed_line);
            }
        }
        let str_json_input = lines2.join("\n");
        entities = md_to_json(str_json_input)
        //str_json_data = JSON.stringify(entities);
    } else {
        // Json format input string
        let lines2 = [];
        for (let line of lines) {    
            trimmed_line = line.trim();
            if (trimmed_line && trimmed_line.length>0 && !trimmed_line.startsWith("#") && !trimmed_line.startsWith("//")) {
                lines2.push(trimmed_line);
            }
        }
        let str_json_input = lines2.join("\n");
        entities = JSON.parse(str_json_input);
    }
}

function gen_json() {
    $('#table_chart').hide();
    $('#div_ai_input').hide();
    $('#div_json').html("");
    let input_text = $('#input_text').val();
    let json_data = md_to_json(input_text);
    let str_json_data = JSON.stringify(json_data, null, 4);
    $('#div_json').html(str_json_data);
    $('#div_json').show();
    console.log(str_json_data);
}

function gen_ai() {
    $('#table_chart').hide();
    $('#div_json').hide();
    $('#div_ai_input').show();

    read_input_into_entities_json();   

    let prev_type = null;
    let lines_out = [];
    for (let [ent_name, entity] of Object.entries(entities)) {
        
        // Type/Cat header
        if (entity.type != prev_type) {
            let str_temp = "";
            if (lines_out.length > 0)
                str_temp = NL + NL + NL;
            str_temp += "# " + entity.type;
            lines_out.push(str_temp);
            prev_type = entity.type;
        }

        // All info for subj
        // Figure out sex and pronoun
        let full_sex = "";
        let pronoun = "It";
        if (entity.hasOwnProperty("sex")) {
            if (entity.sex.toLowerCase().startsWith("m")) {
                full_sex = " (male)";
                pronoun = "He";                
            } else if (entity.sex.toLowerCase().startsWith("f")) {
                full_sex = " (female)";
                pronoun = "She";                
            }
        }
        let str_temp = NL + NL + "## " + entity.name + full_sex + (entity.hasOwnProperty("descript")?(": " +entity.descript):"");
        if (!str_temp.endsWith("."))
            str_temp += ".";
        str_temp += NL;
        lines_out.push(str_temp);

        // Reln
        if (entity.hasOwnProperty("reln")) {
            for (let [conx, objects] of Object.entries(entity.reln)) {
                let str_obj_list = "";
                let num_objs = objects.length;
                for (let i=0; i<num_objs; i++) {
                    let obj = objects[i];
                    if (i==0)
                        str_obj_list += obj;
                    else if (i==(num_objs-1))
                        str_obj_list += ", and " + obj;
                    else
                        str_obj_list += ", " + obj;
                }
                str_temp = pronoun + " " + conx + " " + str_obj_list + ". ";
                lines_out.push(str_temp);
            }
        }
    }
    let str_out = lines_out.join("");
    $("#textarea_ai_input_content").val(str_out);
}

function gen_chart() {    
    reset_state();

    $('#div_ai_input').hide();
    $('#div_json').hide();
    $('#table_chart').show();

    read_input_into_entities_json();

    // Extract data and make all needed maps
    // We enrich the entities to add the rev reln
    // We also gen types list and type to subj map.
    process_entities();

    // The UI from the data
    genDataToHtml();
}


function safe_nav_to_heroes() {

    location.href = '../index.html';
}

function popup_instructions() {
    $("#dialog_instructions").dialog("open");
}

function popup_dialog_graph_explanation() {
    $("#dialog_graph_explanation").dialog("open");
}

function popup_privacy() {
    $("#dialog_privacy").dialog("open");
}


$(document).ready(function() {
    $("#dialog_instructions").dialog({  
        autoOpen: false,
        dialogClass: 'style_dialog',
        minWidth: 370
     });
     $("#dialog_graph_explanation").dialog({  
        autoOpen: false,
        dialogClass: 'style_dialog',
        minWidth: 370
     });
    $("#dialog_privacy").dialog({  
        autoOpen: false,
        dialogClass: 'style_dialog'
     });
     $("#dialog_safe_nav_heroes").dialog({  
        autoOpen: false,    
     });
     $('#table_chart').hide();
     $('#div_json').hide();
     $('#div_ai_input').hide();

     window.addEventListener("beforeunload", function (e) {
        var confirmationMessage = 'It looks like you have been editing something. '
                                + 'If you leave before saving, your changes will be lost.';

        (e || window.event).returnValue = confirmationMessage; //Gecko + IE
        return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
    });

    let cur_text = $("#input_text").val();
    if (cur_text == null || cur_text.length < 2) {
        $("#input_text").text(STARTING_INPUT_TEXT);
    }
});

