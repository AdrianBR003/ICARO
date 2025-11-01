package com.icaro.icarobackend.service;

import com.icaro.icarobackend.dto.NewsDTO;
import com.icaro.icarobackend.model.New;
import com.icaro.icarobackend.repository.NewRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class NewService {

    NewRepository newRepository;

    private static final int ITEMS_PER_PAGE = 5;


    public NewService(NewRepository newRepository) {
        this.newRepository = newRepository;
    }

    public List<New> findAll() {
        return newRepository.findAll();
    }

    public Page<New> findPage(Pageable pageable) {
        return newRepository.findAll(pageable);
    }

    public Page<NewsDTO> searchNews(String query, Pageable pageable) {
        // Primero, obtener TODOS los resultados ordenados como en tu listado principal
        List<New> allNews = newRepository.findAllByOrderByPublicationDateDesc();

        // Filtrar los que coinciden con la búsqueda
        List<NewsDTO> matchingNews = new ArrayList<>();

        for (int i = 0; i < allNews.size(); i++) {
            New news = allNews.get(i);

            // Verificar si coincide con la búsqueda
            boolean matches = news.getTitle().toLowerCase().contains(query.toLowerCase()) ||
                    news.getDescription().toLowerCase().contains(query.toLowerCase());

            if (matches) {
                // Calcular en qué página está este item
                int pageNumber = i / ITEMS_PER_PAGE;
                int positionInPage = i % ITEMS_PER_PAGE;

                NewsDTO dto = NewsDTO.builder()
                        .id(news.getId())
                        .title(news.getTitle())
                        .description(news.getDescription())
                        .pageNumber(pageNumber)
                        .build();
                dto.setPositionInPage(positionInPage);

                matchingNews.add(dto);
            }
        }

        // Convertir la lista a Page
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), matchingNews.size());

        List<NewsDTO> pageContent = matchingNews.subList(start, end);

        return new PageImpl<>(pageContent, pageable, matchingNews.size());
    }

    public void addNew(New n) {
        newRepository.save(n);
    }

    public boolean checkId(String id) {
        return this.newRepository.findById(id).isPresent();
    }

    public Optional<New> findById(String id) {
        return this.newRepository.findById(id);
    }

    public void removeNewId(String id) {
        this.newRepository.deleteById(id);
    }

    public List<New> getHighlightedNews() {
        return this.newRepository.findByHighlighted(true);
    }
}
