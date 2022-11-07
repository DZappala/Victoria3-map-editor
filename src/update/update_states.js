import { full_data,full_map_data } from "../index.js"
import { do_draw } from "../drawing_little.js"

var state_key = 5000

const update_map = (provs_name,state_name,country_name) => {
    // colormap[hexcolor]: [sindex]
    // full_data.statepointmap[statefullname]: [sindex]
    // full_data.statecolormap[statefullname]: [hexcolor]
    let local_tp = false

    let history_states = full_map_data.history_state_dict["STATES"]

    for (let prov of provs_name){
        // prov 

        local_tp = false
        let sindex_list = full_data.colormap[prov]
        let index_to_del = -1
        let old_state = ""
        let old_country = ""
        // sub from state point map

        

        for (let si=0,sp=Object.keys(full_data.statepointmap),splen=sp.length;si<splen;si++){
            let statepoint = sp[si]
            index_to_del = -1
            if (full_data.statepointmap[statepoint].indexOf(sindex_list[0]) >=0 ){ 
                if (statepoint == `${state_name}.region_state:${country_name}`) {local_tp=true;break}
                let oldold =  statepoint.split(".region_state:")
                old_state = oldold[0]
                old_country = oldold[1]
                
                let old_state_block = history_states[old_state]["create_state"]

                if ( !(old_state_block instanceof Array)){
                    old_state_block["owned_provinces"] = old_state_block["owned_provinces"].filter(item => item!=prov)
                    if (old_state_block["owned_provinces"].length == 0){
                        delete history_states[old_state]
                        delete full_map_data.state_regions_map[old_state.replace("s:","")]
                    }
                } else {
                    for (let j=0;j<old_state_block.length;j++){
                        if (old_state_block[j]["country"] == old_country){
                            old_state_block[j]["owned_provinces"] = old_state_block[j]["owned_provinces"].filter(item => item!=prov)
                            if (old_state_block[j]["owned_provinces"].length == 0){
                                old_state_block = old_state_block.filter((items,index) => ![j].includes(index))

                            }
                        }
                    }

                }
                
                full_data.statepointmap[statepoint] = full_data.statepointmap[statepoint].filter(el => !sindex_list.includes(el))
                break
            }

        }

        if (state_name != old_state && full_map_data.state_regions_map[old_state.replace("s:","")] ){
            full_map_data.state_regions_map[old_state.replace("s:","")]["provinces"] = full_map_data.state_regions_map[old_state.replace("s:","")]["provinces"].filter(item => item!=prov)
        }
        // add to state point map
        if (!local_tp){
            full_map_data.strategic_data_lock = false
            if (full_map_data.state_regions_map[state_name.replace("s:","")]){
                if (!(full_map_data.state_regions_map[state_name.replace("s:","")]["provinces"].indexOf(prov) >= 0))
                full_map_data.state_regions_map[state_name.replace("s:","")]["provinces"].push(prov)
            } else {
                full_map_data.state_regions_map[state_name.replace("s:","")] = {
                    "id" :state_key,
                    "provinces":[prov]
                }

                state_key += 1

                for (let i=0,region=Object.keys(full_map_data.strategic_regions_map);i<region.length;i++){
                    if (full_map_data.strategic_regions_map[region[i]]["states"].indexOf(old_state.replace("s:","")) > -1){
                        full_map_data.strategic_regions_map[region[i]]["states"].push(state_name.replace("s:",""))
                        if (index_to_del){
                            full_map_data.strategic_regions_map[region[i]]["states"] = full_map_data.strategic_regions_map[region[i]]["states"].filter(item => item!=old_state)
                        }
                        break
                    }
                }
            }


            let full_sr_name = `${state_name}.region_state:${country_name}`
            if (full_data.statepointmap[full_sr_name]){
                // exists
                let state_name_block = history_states[state_name]["create_state"]
                if ( !(state_name_block instanceof Array)){
                    state_name_block["owned_provinces"].push(prov)
                } else if (full_data.statepointmap[full_sr_name].length == 0){
                    state_name_block.push({"country":country_name,"owned_provinces":[prov]})
                } else {
                    for (let j=0;j<state_name_block.length;j++){
                        if (state_name_block[j]["country"] == country_name){
                            state_name_block[j]["owned_provinces"].push(prov)
                        }
                    }

                }

                full_data.statepointmap[full_sr_name] = [...full_data.statepointmap[full_sr_name],...sindex_list]


            } else {
                // no exists
                if (!history_states[state_name]){
                    history_states[state_name] = {"create_state":{"country":country_name,"owned_provinces":[prov]}}
                } else if (history_states[state_name]["create_state"] instanceof Array){
                    history_states[state_name]["create_state"].push({"country":country_name,"owned_provinces":[prov]})
                } else if (!(history_states[state_name]["create_state"] instanceof Array)) {
                    history_states[state_name]["create_state"] = [history_states[state_name]["create_state"],{"country":country_name,"owned_provinces":[prov]}]
                }
                full_data.statepointmap[full_sr_name] = [...sindex_list]
                full_data.statecolormap[full_sr_name] = [Math.ceil(Math.random()*255),Math.ceil(Math.random()*255),Math.ceil(Math.random()*255)]

            }
            // colorize
            for (let i=0;i<sindex_list.length;i++){
                if (full_data.state_data.data[sindex_list[i]]!=0&&full_data.state_data.data[sindex_list[i]+1]!=0&&full_data.state_data.data[sindex_list[i]+2]!=0){
                    full_data.state_data.data[sindex_list[i]] = full_data.statecolormap[full_sr_name][0]
                    full_data.state_data.data[sindex_list[i]+1] = full_data.statecolormap[full_sr_name][1]
                    full_data.state_data.data[sindex_list[i]+2] = full_data.statecolormap[full_sr_name][2]
                }
            }
            
        }
        
    }
    provs_name.clear()
    full_data.ctx.putImageData(full_data.state_data, 0, 0)
    do_draw()

}

export {update_map}