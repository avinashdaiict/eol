class TaxonDataExemplarsController < ApplicationController

  before_filter :restrict_to_full_curators

  def create
    parent = case params[:type]
             when "UserAddedData"
               UserAddedData.find(params[:id])
             when "DataPointUri"
               DataPointUri.find(params[:id])
             end
    raise "Couldn't find a parent of type #{params[:type]} with ID #{params[:id]}" if parent.nil?
    # Simply to avoid using #update (thus cleaner code, though a bit less RESTful), we'll just delete anything that already exists:
    TaxonDataExemplar.delete_all(taxon_concept_id: params[:taxon_concept_id], parent_id: parent.id, parent_type: parent.class.name)
    exclude = params.has_key?(:exclude) && params[:exclude] # Argh! For whatever reason, nils are stored as nil in the DB and that breaks scopes.
    @taxon_data_exemplar = TaxonDataExemplar.create(taxon_concept_id: params[:taxon_concept_id], parent: parent, exclude: exclude )
    # TODO - if there are too many exemplars (more than are allowed), we need to give them a warning or something.  Sadly, that is expensive to
    # calculate...  Hmmmn...
    respond_to do |format|
      format.html do
        if @taxon_data_exemplar
          flash[:notice] = params[:exclude] ? I18n.t(:data_row_exemplar_removed) : flash[:notice] = I18n.t(:data_row_exemplar_added)
        end
        redirect_to taxon_data_path(params[:taxon_concept_id])
      end
      format.js { }
    end
  end

end
